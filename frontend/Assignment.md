Assignment Title: Round-Robin Coupon Distribution with Admin Panel
Objective:
Develop a live web application that distributes coupons to guest users in a round-robin
manner while providing an admin panel to manage coupons and prevent abuse.
Requirements:

1. Coupon Distribution (User Side)
   ● Maintain a list of coupons in a database.
   ● Assign coupons sequentially to users without repetition.
2. Guest User Access
   ● Users can claim coupons without logging in.
3. Abuse Prevention
   ● IP Tracking: Prevent multiple claims from the same IP within a cooldown period.
   ● Cookie-Based Tracking: Restrict claims from the same browser session.
4. User Feedback
   ● Display messages for successful claims or time restrictions.
5. Admin Panel (Server-Side Management)
   ● Login for Admin: Secure access to admin functionality.
   ● View Coupons: Show a list of all available and claimed coupons.
   ● Add/Update Coupons: Admin can upload new coupons or modify existing ones.
   ● User Claim History: Show which users (IP/browser session) claimed coupons.
   ● Toggle Coupon Availability: Enable/disable certain coupons dynamically.
6. Live Deployment
   ● Host the application with a publicly accessible link.
7. Documentation
   ● Setup instructions and a brief explanation of the implementation.
   Evaluation Criteria:
   ✅ Functionality: Coupon distribution with admin controls.
   ✅ Security: Robust abuse prevention.
   ✅ User Experience: Smooth user & admin UI.
   ✅ Code Quality: Maintainable and scalable.
   ✅ Deployment: Working live URL with credentials for testing.
   Submission Guidelines:
   🔹 Live URL of the deployed application.
   🔹 Admin Credentials (if required) for testing.
   🔹 GitHub Repo (Optional) for code review.
