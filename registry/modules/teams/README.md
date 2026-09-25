# teams

Organizations for multi-user SaaS, using Better Auth's organization plugin.

- **Team switcher** in the app top bar: switch the active team or create one.
- **Roles**: owner, admin and member. Owners and admins rename the team, invite, change roles
  and remove members; members can leave.
- **Invitations by email** (`/invite/<id>`): the recipient signs in or signs up, then accepts
  or declines. Invites expire after `teams.invitationExpiresInDays`.
- `/settings/team` tab and a dashboard widget with the active team and member count.
- Fully typed: the plugin is added through the auth-plugins slot, so `auth.api.createInvitation`
  and friends are typed in your code.

## Setup

None. Invitation emails land in `/dev/outbox` during development.

## Environment

No variables of its own.

## Usage

```ts
import { getActiveTeam, canManage } from "@/lib/teams/queries";

const team = await getActiveTeam(); // { id, name, members[], invitations[] } | null
```

Scope your own data by team with an `organization_id` column and
`session.session.activeOrganizationId`.

## Customization

- Limits: `teams` block in `site.config.ts` (`membershipLimit`, `invitationExpiresInDays`).
- Roles and permissions: pass `roles`/`ac` to `organization()` in `src/lib/teams/auth-plugin.ts`
  (see Better Auth's access-control docs).
- Invitation email: `src/emails/team-invite.tsx`.

## Removal

`pnpm site remove teams`. Drop the `organization`, `member` and `invitation` tables with a
migration.
