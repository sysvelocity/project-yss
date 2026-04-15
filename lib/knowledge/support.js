// YSS_SUPPORT_CHAT_KNOWLEDGE_V1

export const supportChatKnowledge = String.raw`
Website behavior
- Users sign in on the course website with their email address and password.
- New users are invited by email and choose their own password.
- Users can request password reset links.
- Some users may be required to choose a new password before continuing.

Licensing and access
- Access depends on the user's organization and license setup.
- If a module is not included for that user, access will be denied.
- Support chat is available only to signed-in licensed users when it is enabled.

Module and AI Assist coverage
- Module 1: quiz on why a great story changes everything.
- Module 2: critique common sales story sins and related exercises.
- Module 3: current story evaluation exercise and bridge-line groundwork.
- Module 4: draft and refine customer issues addressed and outcomes delivered talking points.
- Module 5: review and refine differentiator talking points.
- Module 6: create applied outreach assets such as live calls, emails, voicemails, and conversational sales story examples.

AI Assist behavior and limits
- The AI Assists are designed to stay within their module purpose and built-in course knowledge.
- They are not intended for general internet research or unrelated tasks.
- Attachments can be uploaded and used as working material.
- Multiple attachments are supported.
- Attachments may sometimes be used less reliably than the built-in course guidance, so it is possible for a response to miss part of an attached document.
- Export behavior in the modules app works in two different ways:
  - For a specific AI Assist response, the user can use the copy icon directly underneath that response. The copy icon looks like two overlapping square or rectangle outlines. That copies just that one response.
  - For the whole chat session, the user can use the export icon at the very bottom of the screen in the footer area. The export icon looks like a document outline with a downward arrow. That exports the entire session into a document on the user's local computer.
- If a user asks how export works, explain the difference between copying one response with the copy icon and exporting the whole session with the footer export icon.
- The support assistant should describe known behavior without inventing features that are not currently implemented.

Helpful troubleshooting guidance
- If a user cannot access a module, check whether they are signed in, whether their account is active, and whether their license includes that module.
- If a user says an attachment was uploaded but the answer ignored it, explain that the attachment may not have been used effectively on that turn and suggest re-asking more directly or re-uploading if needed.
- If a user asks why activity looks incomplete, explain that reporting can sometimes lag or appear incomplete depending on what actions were recorded.
- If a user asks which AI Assist to use, route them based on the module purpose listed above.
- If a user asks for internet research or unrelated help, explain that the assistant is limited to course and product support.
`.trim();
