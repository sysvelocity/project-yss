// YSS_SUPPORT_CHAT_KNOWLEDGE_V1

export const supportChatKnowledge = String.raw`
System overview
- There are two separate Vercel apps:
  - the branded course website
  - the standalone AI modules app
- The website handles auth, admin, licensing, user management, usage tracking, and secure module launching.
- The modules app handles the AI Assist experiences.

Website behavior
- Users sign in on the course website with Supabase email/password auth.
- New users are invited by email and choose their own password.
- Users can request password reset links.
- If must_reset_password is true, the user must choose a new password before continuing.
- Admins can create organizations, add up to three approved email domains, create a seat-counted license, invite users, deactivate/reactivate users, force resets, and delete users.

Licensing and access
- Each organization has one active license and a shared seat pool.
- Users consume seats through license assignments.
- Licenses define which modules are allowed.
- The website mints a short-lived signed token before opening an AI Assist in the separate modules app.
- The modules app validates that token before granting access.
- If a license is inactive, expired, or does not allow a module, access is denied.
- Support chat is intended to be available to authenticated licensed users as a protected support surface.

Tracking and sessions
- The website records usage events in public.usage_events.
- Tracked events include login, module open, video play, AI Assist launch, download click, lesson completion toggle, and password reset completion.
- User sessions are tracked separately in public.user_sessions.
- Admin reporting uses those tables to show activity and last active information.

Module and AI Assist coverage
- Module 1: quiz on why a great story changes everything.
- Module 2: critique common sales story sins and related exercises.
- Module 3: current story evaluation exercise and bridge-line groundwork.
- Module 4: draft and refine customer issues addressed and outcomes delivered talking points.
- Module 5: review and refine differentiator talking points.
- Module 6: create applied outreach assets such as live calls, emails, voicemails, and conversational sales story examples.

AI Assist behavior and limits
- The modules app uses OpenAI and module-specific prompts.
- Built-in module knowledge is grounded in internal support or module knowledge, not internet browsing.
- Attachments can be uploaded and used as working material.
- Multiple attachments are supported in the modules app.
- Attachments are still retrieval-based, so they can sometimes be used less reliably than built-in in-context knowledge.
- Exports exist for session output, but export behavior depends on the current UI implementation.
- The support assistant should describe known behavior without inventing features that are not currently implemented.

Helpful troubleshooting guidance
- If a user cannot access a module, check login status, active profile status, license assignment, license expiry, and whether the module is included in allowed_modules.
- If a user says an attachment was uploaded but the answer ignored it, explain that upload success does not always guarantee the model used attachment retrieval effectively on that turn.
- If a user asks why activity looks incomplete, note that usage tracking depends on tracked event types and dashboard query behavior.
- If a user asks which AI Assist to use, route them based on the module purpose listed above.
- If a user asks for internet research or unrelated help, explain that the assistant is limited to course and product support.
`.trim();
