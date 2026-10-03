import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import { Box, Link, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import DetailSection, { SectionEmpty } from '@/components/submissions/detail/DetailSection';
import { visuallyHidden } from '@/lib/a11y';
import { formatDate } from '@/lib/format';
import { toSafeExternalUrl } from '@/lib/safe-url';
import { Document } from '@/lib/types';

// Icon per document type (the seed data's types); anything else gets a generic file icon.
const DOC_TYPE_ICONS: Record<string, ReactNode> = {
  Summary: <DescriptionOutlinedIcon />,
  Spreadsheet: <TableChartOutlinedIcon />,
  Presentation: <SlideshowOutlinedIcon />,
  Contract: <GavelOutlinedIcon />,
};

// Supporting files. Each opens in a new tab; a URL that isn't plain http(s) (for example a
// "javascript:" link in the data) is never made clickable.
export default function DocumentsSection({ documents }: { documents: Document[] }) {
  return (
    <DetailSection title="Documents" count={documents.length}>
      {documents.length === 0 ? (
        <SectionEmpty>No documents uploaded.</SectionEmpty>
      ) : (
        <Stack component="ul" spacing={2} sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {documents.map((doc) => {
            const href = toSafeExternalUrl(doc.fileUrl);
            return (
              <Stack component="li" key={doc.id} direction="row" spacing={1.5}>
                <Box
                  aria-hidden="true"
                  sx={(theme) => ({
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    color: theme.vars.palette.primary.main,
                    backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.08)`,
                    '& svg': { fontSize: 20 },
                  })}
                >
                  {DOC_TYPE_ICONS[doc.docType] ?? <InsertDriveFileOutlinedIcon />}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  {href ? (
                    <Link
                      component="a"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        position: 'relative', // contains the hidden text below
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontWeight: 600,
                        typography: 'body2',
                      }}
                    >
                      {doc.title}
                      <OpenInNewRoundedIcon aria-hidden="true" sx={{ fontSize: 14 }} />
                      <Box component="span" sx={visuallyHidden}>
                        (opens in a new tab)
                      </Box>
                    </Link>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {doc.title}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {doc.docType} · Uploaded {formatDate(doc.uploadedAt)}
                    {!href && ' · Link unavailable'}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      )}
    </DetailSection>
  );
}
