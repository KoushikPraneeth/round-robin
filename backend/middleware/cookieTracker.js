const crypto = require('crypto');
const signature = require('cookie-signature');

const COOKIE_NAME = 'claimSession';
const COOLDOWN_PERIOD = 30 * 60 * 1000; // 30 minutes in milliseconds

// Get secret from environment or generate one
const COOKIE_SECRET = process.env.COOKIE_SECRET || crypto.randomBytes(32).toString('hex');

function signSession(value) {
  return signature.sign(value, COOKIE_SECRET);
}

function unsignSession(signedValue) {
  return signature.unsign(signedValue, COOKIE_SECRET);
}

module.exports = function(req, res, next) {
  const signedSession = req.cookies[COOKIE_NAME];
  const now = Date.now();

  if (signedSession) {
    try {
      const sessionValue = unsignSession(signedSession);
      if (!sessionValue) {
        // Cookie signature invalid
        console.warn('Invalid cookie signature detected');
        return res.status(403).json({
          message: 'Invalid session',
          error: 'INVALID_SESSION'
        });
      }

      const lastClaimTime = parseInt(sessionValue, 10);
      const timeSinceLastClaim = now - lastClaimTime;

      if (timeSinceLastClaim < COOLDOWN_PERIOD) {
        const remainingMinutes = Math.ceil((COOLDOWN_PERIOD - timeSinceLastClaim) / (60 * 1000));
        return res.status(429).json({
          message: 'You have already claimed a coupon from this browser session.',
          remainingTime: remainingMinutes,
          nextAvailableAt: new Date(lastClaimTime + COOLDOWN_PERIOD)
        });
      }
    } catch (error) {
      console.error('Cookie parsing error:', error);
      // Clear invalid cookie
      res.clearCookie(COOKIE_NAME, { path: '/api/coupons/claim' });
    }
  }

  // Set or update cookie with signed value
  const signedValue = signSession(now.toString());
  res.cookie(COOKIE_NAME, signedValue, {
    maxAge: COOLDOWN_PERIOD,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/coupons/claim',
    signed: true,
    maxAge: COOLDOWN_PERIOD // 30 minutes expiration
  });

  // Add session info to request for claim history
  req.claimSession = {
    timestamp: now,
    isNew: !signedSession
  };

  // Set session ID in response headers for debugging/monitoring
  const sessionId = crypto.createHash('sha256')
    .update(signedValue)
    .digest('hex')
    .slice(0, 8);
  res.setHeader('X-Session-ID', sessionId);

  next();
};
