"use client";

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Delivery, DeliveryHistory, DeliveryStatus, User, Region, DeliveryItem } from '../types/delivery';
import { format } from 'date-fns';
import {
  fetchDeliveryItems,
  updateDeliveryItem,
  deleteDeliveryItem,
  addDeliveryItem,
  fetchProducts,
} from '../services/delivery.service';

interface DriverAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  drivers: User[];
  selectedDriverId: number | null;
  onDriverSelect: (driverId: number) => void;
  regions: Region[];
  selectedRegionId: number | null;
  onRegionSelect: (regionId: number | null) => void;
}

export function DriverAllocationModal({
  isOpen,
  onClose,
  onSave,
  drivers,
  selectedDriverId,
  onDriverSelect,
  regions,
  selectedRegionId,
  onRegionSelect,
}: DriverAllocationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Жолооч сонгох</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
         
          <div className="space-y-2">
            <Label>Жолооч</Label>
            <Select
              value={selectedDriverId?.toString() || ''}
              onValueChange={(value) => onDriverSelect(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Жолооч сонгох" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id.toString()}>
                    {driver.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Цуцлах
          </Button>
          <Button onClick={onSave}>Хадгалах</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  statuses: DeliveryStatus[];
  selectedStatusId: number | null;
  onStatusSelect: (statusId: number) => void;
}

export function StatusChangeModal({
  isOpen,
  onClose,
  onSave,
  statuses,
  selectedStatusId,
  onStatusSelect,
}: StatusChangeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Төлөв солих</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            value={selectedStatusId?.toString() || ''}
            onValueChange={(value) => onStatusSelect(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Төлөв сонгох" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Цуцлах
          </Button>
          <Button onClick={onSave}>Хадгалах</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DeliveryHistory[];
}

export function HistoryModal({ isOpen, onClose, history }: HistoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Хүргэлтийн түүх</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Түүх олдсонгүй</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Огноо</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead>Жолооч</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: item.status_name.color,
                          color: 'white',
                        }}
                      >
                        {item.status_name.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.driver
                        ? `${item.driver.username} (${item.driver.phone})`
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Хаах</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  delivery: Delivery | null;
  formData: { phone: string; address: string; price: string; delivery_date: string };
  onFormDataChange: (data: { phone: string; address: string; price: string; delivery_date: string }) => void;
  /** Refresh parent list when line items change */
  onItemsChanged?: () => void;
}

export function EditModal({
  isOpen,
  onClose,
  onSave,
  delivery,
  formData,
  onFormDataChange,
  onItemsChanged,
}: EditModalProps) {
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [editingQuantities, setEditingQuantities] = useState<Record<number, number>>({});
  const [merchantGoods, setMerchantGoods] = useState<Array<{ id: string; name: string; stock: number }>>([]);
  const [loadingGoods, setLoadingGoods] = useState(false);
  const [addGoodId, setAddGoodId] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState<string>('1');
  const [addingItem, setAddingItem] = useState(false);

  // Fetch items when modal opens
  useEffect(() => {
    if (isOpen && delivery) {
      loadItems();
    } else {
      setItems([]);
      setEditingQuantities({});
      setMerchantGoods([]);
      setAddGoodId('');
      setAddQuantity('1');
    }
  }, [isOpen, delivery]);

  // Load this delivery merchant's goods (only those can be added)
  useEffect(() => {
    if (!isOpen || !delivery) return;
    const merchantId = delivery.merchant_id ?? delivery.merchant?.id;
    if (!merchantId) return;

    let cancelled = false;
    setLoadingGoods(true);
    fetchProducts(merchantId)
      .then((list) => {
        if (!cancelled) setMerchantGoods(list);
      })
      .catch(() => {
        if (!cancelled) setMerchantGoods([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingGoods(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, delivery]);

  const loadItems = async () => {
    if (!delivery) return;
    setLoadingItems(true);
    try {
      const fetchedItems = await fetchDeliveryItems(delivery.id);
      setItems(fetchedItems);
      // Initialize editing quantities
      const initialQuantities: Record<number, number> = {};
      fetchedItems.forEach((item) => {
        initialQuantities[item.id] = item.quantity;
      });
      setEditingQuantities(initialQuantities);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Бараа ачааллахад алдаа гарлаа');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setEditingQuantities((prev) => ({
      ...prev,
      [itemId]: quantity,
    }));
  };

  const handleUpdateItem = async (itemId: number) => {
    if (!delivery) return;
    const newQuantity = editingQuantities[itemId];
    if (newQuantity === undefined || newQuantity < 0) {
      toast.error('Тоо хэмжээ буруу байна');
      return;
    }

    try {
      await updateDeliveryItem(delivery.id, itemId, newQuantity);
      toast.success('Амжилттай шинэчлэгдлээ');
      await loadItems();
      onItemsChanged?.();
    } catch (error: any) {
      toast.error(error.message || 'Шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!delivery) return;
    if (!confirm('Та энэ барааг устгахдаа итгэлтэй байна уу?')) {
      return;
    }

    try {
      await deleteDeliveryItem(delivery.id, itemId);
      toast.success('Амжилттай устгагдлаа');
      await loadItems();
      onItemsChanged?.();
    } catch (error: any) {
      toast.error(error.message || 'Устгахад алдаа гарлаа');
    }
  };

  /** Бараа нэмэх: зөвхөн Шинэ (1), Жолоочид (2) */
  const canAddLineItems = delivery ? [1, 2].includes(Number(delivery.status)) : false;

  const addGoodOptions = useMemo(
    () =>
      merchantGoods.map((g) => ({
        value: String(g.id),
        label: `${g.name} (${g.stock ?? 0} ш)`,
        disabled: (g.stock || 0) < 1,
      })),
    [merchantGoods]
  );

  const handleAddLineItem = async () => {
    if (!delivery || !addGoodId) {
      toast.error('Бараа сонгоно уу');
      return;
    }
    const qty = parseInt(addQuantity, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      toast.error('Тоо хэмжээ 1-ээс их байна');
      return;
    }

    setAddingItem(true);
    try {
      await addDeliveryItem(delivery.id, {
        good_id: parseInt(addGoodId, 10),
        quantity: qty,
      });
      toast.success('Бараа нэмэгдлээ');
      setAddQuantity('1');
      await loadItems();
      onItemsChanged?.();
      const merchantId = delivery.merchant_id ?? delivery.merchant?.id;
      if (merchantId) {
        try {
          const list = await fetchProducts(merchantId);
          setMerchantGoods(list);
        } catch {
          /* ignore */
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Нэмэхэд алдаа гарлаа');
    } finally {
      setAddingItem(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-4 overflow-x-hidden overflow-y-visible sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Утас & Хаяг засах</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Утас *</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) =>
                onFormDataChange({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Хаяг *</Label>
            <Textarea
              id="edit-address"
              value={formData.address}
              onChange={(e) =>
                onFormDataChange({ ...formData, address: e.target.value })
              }
              rows={4}
              className="min-h-[100px] resize-y"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price">Үнэ *</Label>
            <Input
              id="edit-price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                onFormDataChange({ ...formData, price: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-delivery_date">Хүргэх огноо *</Label>
            <Input
              id="edit-delivery_date"
              type="date"
              value={formData.delivery_date}
              onChange={(e) =>
                onFormDataChange({ ...formData, delivery_date: e.target.value })
              }
              required
            />
          </div>

          {/* Items Section */}
          <div className="space-y-2 border-t pt-4">
            <Label>Бараа</Label>

            {!canAddLineItems && delivery && (
              <p className="text-sm text-muted-foreground">
                Бараа нэмэх нь зөвхөн «Шинэ» (1), «Жолоочид» (2) төлөвт боломжтой.
              </p>
            )}

            {loadingItems ? (
              <p className="text-sm text-gray-500">Ачааллаж байна...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500">Бараа байхгүй</p>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Бараа</TableHead>
                      <TableHead>Тоо хэмжээ</TableHead>
                      <TableHead>Үйлдэл</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.good?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              value={editingQuantities[item.id] ?? item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-20"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateItem(item.id)}
                              disabled={
                                editingQuantities[item.id] === item.quantity
                              }
                            >
                              Хадгалах
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Устгах
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
        </div>

        {canAddLineItems && (
          <div className="shrink-0 rounded-md border bg-muted/40 p-3 space-y-3">
            <p className="text-sm text-muted-foreground">
              Зөвхөн «Шинэ», «Жолоочид» төлөвт нэмнэ. Дэлгүүрийн агуулахын үлдэгдлээс (Үлдэгдэл) хасагдана.
            </p>
            {loadingGoods ? (
              <p className="text-sm text-gray-500">Барааны жагсаалт ачааллаж байна...</p>
            ) : merchantGoods.length === 0 ? (
              <p className="text-sm text-amber-700">Дэлгүүрийн бараа олдсонгүй.</p>
            ) : (
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1 min-w-[200px] flex-1">
                  <Label className="text-xs">Бараа сонгох</Label>
                  <SearchableSelect
                    options={addGoodOptions}
                    value={addGoodId || undefined}
                    onValueChange={setAddGoodId}
                    placeholder="Бараа сонгох"
                    searchPlaceholder="Барааны нэрээр хайх..."
                    emptyMessage="Илэрц олдсонгүй."
                    disabled={loadingGoods}
                    className="min-w-[220px] flex-1"
                  />
                </div>
                <div className="space-y-1 w-24">
                  <Label className="text-xs">Тоо</Label>
                  <Input
                    type="number"
                    min={1}
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddLineItem}
                  disabled={addingItem || !addGoodId}
                >
                  {addingItem ? 'Нэмж байна...' : 'Нэмэх'}
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose}>
            Цуцлах
          </Button>
          <Button onClick={onSave}>Хадгалах</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeliveryDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  deliveryDate: string;
  onDeliveryDateChange: (date: string) => void;
}

export function DeliveryDateModal({
  isOpen,
  onClose,
  onSave,
  deliveryDate,
  onDeliveryDateChange,
}: DeliveryDateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Хүргэх огноо тохируулах</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-delivery_date">Хүргэх огноо *</Label>
            <Input
              id="bulk-delivery_date"
              type="date"
              value={deliveryDate}
              onChange={(e) => onDeliveryDateChange(e.target.value)}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Цуцлах
          </Button>
          <Button onClick={onSave}>Хадгалах</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

