'use client';

import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useId, useState } from 'react';

import { toComposeLinks } from '@/lib/safe-url';

type EmailBrokerMenuProps = {
  email: string;
  subject: string;
  // Copies text and confirms with a message (the page's snackbar).
  onCopy: (text: string, message: string) => void;
};

// "Email broker" opens a short menu instead of being a bare mailto: link. A mailto: link
// needs a mail app registered on the computer; without one (common for webmail users) the
// click silently does nothing. The menu always offers something that works: the mail app,
// Gmail or Outlook on the web, or copying the address. Each prefills the subject.
export default function EmailBrokerMenu({ email, subject, onCopy }: EmailBrokerMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const buttonId = useId();
  const menuId = useId();
  const links = toComposeLinks(email, subject);
  const close = () => setAnchor(null);

  if (!links) return null;

  return (
    <>
      <Button
        id={buttonId}
        variant="contained"
        startIcon={<MailOutlineRoundedIcon />}
        endIcon={<KeyboardArrowDownRoundedIcon />}
        aria-haspopup="menu"
        aria-expanded={anchor ? 'true' : undefined}
        aria-controls={anchor ? menuId : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Email broker
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        // Keep MUI's default portal: while the menu is open, MUI hides the rest of the page from
        // assistive technology, which only works when the menu sits outside the app's root.
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: {
            'aria-labelledby': buttonId,
          },
          paper: { sx: { mt: 0.5, minWidth: 260 } },
        }}
      >
        <MenuItem component="a" href={links.mailto} onClick={close}>
          <ListItemIcon>
            <MailOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open in email app</ListItemText>
        </MenuItem>
        <MenuItem
          component="a"
          href={links.gmail}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
        >
          <ListItemIcon>
            <OpenInNewRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Compose in Gmail</ListItemText>
        </MenuItem>
        <MenuItem
          component="a"
          href={links.outlook}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
        >
          <ListItemIcon>
            <OpenInNewRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Compose in Outlook</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onCopy(email, 'Email address copied');
            close();
          }}
        >
          <ListItemIcon>
            <ContentCopyRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Copy email address" secondary={email} />
        </MenuItem>
      </Menu>
    </>
  );
}
