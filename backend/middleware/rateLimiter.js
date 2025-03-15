const ClaimHistory = require('../models/ClaimHistory');
const COOLDOWN_PERIOD = 30 * 60 * 1000; // 30 minutes in milliseconds

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  return req.socket.remoteAddress;
}

module.exports = async function(req, res, next) {
  const clientIp = getClientIp(req);

  try {
    const lastClaim = await ClaimHistory.findOne({ ipAddress: clientIp })
      .sort({ createdAt: -1 });

    if (lastClaim) {
      const timeSinceLastClaim = Date.now() - new Date(lastClaim.createdAt).getTime();
      if (timeSinceLastClaim < COOLDOWN_PERIOD) {
        const remainingTime = Math.ceil((COOLDOWN_PERIOD - timeSinceLastClaim) / (60 * 1000));
        return res.status(429).json({
          message: `Please wait ${remainingTime} minute(s) before claiming another coupon.`,
          remainingTime
        });
      }
    }
    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    res.status(500).send("Server error");
  }
};
