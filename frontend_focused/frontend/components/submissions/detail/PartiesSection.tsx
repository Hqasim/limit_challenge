import { Box, Divider, Link, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import DetailSection from '@/components/submissions/detail/DetailSection';
import PersonAvatar from '@/components/submissions/PersonAvatar';
import { toMailtoHref } from '@/lib/safe-url';
import { SubmissionDetail } from '@/lib/types';

// An email address as a mailto link, or plain text if it isn't a usable address.
export function EmailLink({ email, subject }: { email: string | null; subject?: string }) {
  const href = toMailtoHref(email, subject);
  if (!email) return <>—</>;
  if (!href) return <>{email}</>;
  return (
    <Link component="a" href={href} sx={{ wordBreak: 'break-all' }}>
      {email}
    </Link>
  );
}

// One labelled fact, e.g. "Industry  Logistics". Rendered as a definition-list row.
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 500, minWidth: 0 }}>
        {children}
      </Typography>
    </>
  );
}

function FactGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" component="h3" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box
        component="dl"
        sx={{ m: 0, display: 'grid', gridTemplateColumns: '96px 1fr', rowGap: 1, columnGap: 2 }}
      >
        {children}
      </Box>
    </Box>
  );
}

// The parties a submission links: the client company, the broker who sent it in, and the
// internal owner responsible for it.
export default function PartiesSection({ submission }: { submission: SubmissionDetail }) {
  const { company, broker, owner } = submission;

  return (
    <DetailSection title="Details">
      <Stack spacing={2.5} divider={<Divider />}>
        <FactGroup title="Company">
          <Fact label="Legal name">{company.legalName}</Fact>
          <Fact label="Industry">{company.industry || '—'}</Fact>
          <Fact label="Headquarters">{company.headquartersCity || '—'}</Fact>
        </FactGroup>

        <FactGroup title="Broker">
          <Fact label="Name">{broker.name}</Fact>
          <Fact label="Email">
            <EmailLink email={broker.primaryContactEmail} />
          </Fact>
        </FactGroup>

        <FactGroup title="Owner">
          <Fact label="Name">
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PersonAvatar name={owner.fullName} size={22} />
              <span>{owner.fullName}</span>
            </Stack>
          </Fact>
          <Fact label="Email">
            <EmailLink email={owner.email} />
          </Fact>
        </FactGroup>
      </Stack>
    </DetailSection>
  );
}
