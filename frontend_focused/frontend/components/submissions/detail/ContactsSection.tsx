'use client';

import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { Box, Divider, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

import SectionCard, { SectionEmpty } from '@/components/layout/SectionCard';
import { EmailLink } from '@/components/submissions/detail/PartiesSection';
import PersonAvatar from '@/components/submissions/PersonAvatar';
import { toTelHref } from '@/lib/safe-url';
import { Contact } from '@/lib/types';

// Icon + content line, e.g. an envelope and an email address.
function ContactLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', minWidth: 0, typography: 'body2', '& > svg': { fontSize: 16 } }}
    >
      {icon}
      {children}
    </Stack>
  );
}

type ContactsSectionProps = {
  contacts: Contact[];
  // Copies text and confirms with a message (the page's snackbar).
  onCopy: (text: string, message: string) => void;
};

// People to talk to about this submission, with one-click email, call and copy.
export default function ContactsSection({ contacts, onCopy }: ContactsSectionProps) {
  return (
    <SectionCard title="Contacts" count={contacts.length}>
      {contacts.length === 0 ? (
        <SectionEmpty>No contacts on file.</SectionEmpty>
      ) : (
        <Stack
          component="ul"
          spacing={2}
          // Dividers are list items too, since a <ul> may only contain <li> elements.
          divider={<Divider component="li" aria-hidden="true" />}
          sx={{ listStyle: 'none', m: 0, p: 0 }}
        >
          {contacts.map((contact) => {
            const telHref = toTelHref(contact.phone);
            return (
              <Stack component="li" key={contact.id} direction="row" spacing={1.5}>
                <PersonAvatar name={contact.name} size={36} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {contact.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {contact.role || 'Contact'}
                  </Typography>

                  <Stack spacing={0.5} sx={{ mt: 1, color: 'text.secondary' }}>
                    {contact.email && (
                      <ContactLine icon={<MailOutlineRoundedIcon />}>
                        <EmailLink email={contact.email} />
                        <Tooltip title="Copy email">
                          <IconButton
                            size="small"
                            aria-label={`Copy ${contact.name}'s email`}
                            onClick={() => onCopy(contact.email, 'Email copied')}
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </ContactLine>
                    )}
                    {contact.phone && (
                      <ContactLine icon={<PhoneOutlinedIcon />}>
                        {telHref ? (
                          <Link component="a" href={telHref}>
                            {contact.phone}
                          </Link>
                        ) : (
                          <span>{contact.phone}</span>
                        )}
                      </ContactLine>
                    )}
                  </Stack>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      )}
    </SectionCard>
  );
}
