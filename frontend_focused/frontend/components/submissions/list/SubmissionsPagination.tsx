'use client';

import { MenuItem, Pagination, Stack, TextField, useMediaQuery, useTheme } from '@mui/material';

import { PAGE_SIZE_OPTIONS } from '@/lib/submissions/constants';

type SubmissionsPaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

// Footer under the results: page size on the left, page links on the right.
export default function SubmissionsPagination({
  page,
  pageCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: SubmissionsPaginationProps) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack
      direction={{ xs: 'column-reverse', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
    >
      <TextField
        select
        size="small"
        label="Per page"
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        sx={{ width: 110 }}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </TextField>

      {pageCount > 1 && (
        <Pagination
          page={page}
          count={pageCount}
          onChange={(_, next) => onPageChange(next)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
          // Fewer page numbers on phones so the control fits on one line.
          siblingCount={compact ? 0 : 1}
          boundaryCount={1}
          aria-label="Submission pages"
        />
      )}
    </Stack>
  );
}
