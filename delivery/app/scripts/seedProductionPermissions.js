/**
 * Production script: seed all permissions and assign them to a role (default: admin role id 1).
 *
 * Usage (from delivery/ folder):
 *   node app/scripts/seedProductionPermissions.js
 *   node app/scripts/seedProductionPermissions.js --role-id=1
 *
 * Set DB credentials via environment or a .env file in delivery/:
 *   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_DIALECT
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const db = require("../models");
const Permission = db.permissions;
const Role = db.roles;
const RolePermission = db.role_permissions;

const MODULES = [
  "delivery",
  "order",
  "product",
  "good",
  "user",
  "settings",
  "role",
  "warehouse",
  "status",
  "log",
  "dashboard",
  "region",
  "notification",
  "reports",
];

const ACTIONS = [
  "create",
  "view",
  "update",
  "delete",
  "allocate",
  "excel_import",
  "manage",
];

function parseArgs() {
  const args = { roleId: 1 };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--role-id=")) {
      args.roleId = parseInt(arg.split("=")[1], 10);
    }
  }
  return args;
}

async function testConnection() {
  await db.sequelize.authenticate();
  console.log("✅ Database connection OK");
  console.log(
    `   host=${process.env.DB_HOST || "localhost"} db=${process.env.DB_NAME || "localexpress"}`
  );
}

async function seedPermissions() {
  let created = 0;
  let existing = 0;

  for (const moduleName of MODULES) {
    for (const action of ACTIONS) {
      const actionKey = `${action}_${moduleName}`;
      const [permission, wasCreated] = await Permission.findOrCreate({
        where: { module: moduleName, action: actionKey },
        defaults: {
          module: moduleName,
          action: actionKey,
          description: `${action} ${moduleName}`,
        },
      });

      if (wasCreated) {
        created += 1;
        console.log(`✅ Created permission: ${moduleName}:${actionKey}`);
      } else {
        existing += 1;
      }
    }
  }

  return { created, existing };
}

async function assignAllPermissionsToRole(roleId) {
  const role = await Role.findByPk(roleId);
  if (!role) {
    throw new Error(`Role with id=${roleId} not found. Create the role first.`);
  }

  const allPermissions = await Permission.findAll({ attributes: ["id", "module", "action"] });
  if (allPermissions.length === 0) {
    throw new Error("No permissions in database. Seeding may have failed.");
  }

  const deleted = await RolePermission.destroy({ where: { role_id: roleId } });

  const rows = allPermissions.map((p) => ({
    role_id: roleId,
    permission_id: p.id,
  }));

  await RolePermission.bulkCreate(rows);

  console.log(`\n✅ Role "${role.name}" (id=${roleId})`);
  console.log(`   Removed ${deleted} old permission link(s)`);
  console.log(`   Assigned ${rows.length} permission(s)`);
  console.log("\n   Sample permissions now granted:");
  allPermissions.slice(0, 5).forEach((p) => {
    console.log(`   - ${p.module}:${p.action}`);
  });
  if (allPermissions.length > 5) {
    console.log(`   ... and ${allPermissions.length - 5} more`);
  }

  return rows.length;
}

async function main() {
  const { roleId } = parseArgs();

  console.log("=== Gegee Delivery — seed permissions (production) ===\n");
  console.log(`Target role id: ${roleId}\n`);

  try {
    await testConnection();

    console.log("\n--- Step 1: Seed permissions ---");
    const { created, existing } = await seedPermissions();
    console.log(`\n   New: ${created}, already existed: ${existing}`);

    console.log("\n--- Step 2: Assign all permissions to role ---");
    await assignAllPermissionsToRole(roleId);

    console.log("\n=== Done ===");
    console.log(
      "Users with this role must log out and log in again to refresh JWT permissions.\n"
    );
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Failed:", err.message);
    if (err.parent) {
      console.error("   DB:", err.parent.message);
    }
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

main();
