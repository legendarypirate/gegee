/**
 * Mobile app forced-update config.
 * Set APP_MINIMUM_VERSION when you publish a build that old clients must not use (e.g. 1.0.17).
 * Set IOS_STORE_URL to your App Store page (required for iOS "Шинэчлэх").
 */
exports.getVersionConfig = (req, res) => {
  res.json({
    success: true,
    data: {
      minimum_version: process.env.APP_MINIMUM_VERSION || "1.0.0",
      android_store_url:
        process.env.ANDROID_STORE_URL ||
        "https://play.google.com/store/apps/details?id=com.superdeliv.mn",
      ios_store_url: process.env.IOS_STORE_URL || "https://apps.apple.com/us/app/super-delivery-mgl/id6757968548",
      message_mn:
        process.env.APP_UPDATE_MESSAGE_MN ||
        "Шинэ хувилбар гарсан тул апп-аа App Store / Play Store-оос шинэчилж ашиглана уу.",
    },
  });
};
