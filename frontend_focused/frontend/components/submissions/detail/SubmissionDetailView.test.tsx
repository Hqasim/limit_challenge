import { screen, within } from '@testing-library/react';

import SubmissionDetailView from '@/components/submissions/detail/SubmissionDetailView';
import { apiClient } from '@/lib/api-client';
import { rememberListSearch } from '@/lib/submissions/list-return';
import { SubmissionDetail } from '@/lib/types';
import { httpError, networkError } from '@/test/axios-errors';
import { buildBroker, buildDetail } from '@/test/fixtures';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

jest.mock('@/lib/api-client', () => ({
  ...jest.requireActual('@/lib/api-client'),
  apiClient: { get: jest.fn() },
}));
const get = jest.mocked(apiClient.get);

// Answers the detail request with `submission`.
function respondWith(submission: SubmissionDetail) {
  get.mockResolvedValue({ data: submission });
}

// Renders the page and waits for the record to appear.
async function renderLoaded(submission: SubmissionDetail = buildDetail({ id: 12 })) {
  respondWith(submission);
  const view = renderWithProviders(<SubmissionDetailView id={submission.id} />);
  await screen.findByRole('heading', { level: 1, name: submission.company.legalName });
  return view;
}

const section = (name: string) => screen.getByRole('region', { name: new RegExp(`^${name}`) });

beforeEach(() => {
  get.mockReset();
  window.sessionStorage.clear();
});

describe('SubmissionDetailView', () => {
  it('shows a loading state, then the submission with its status, priority and dates', async () => {
    respondWith(buildDetail({ id: 12, status: 'in_review', priority: 'high' }));
    renderWithProviders(<SubmissionDetailView id={12} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading submission');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Acme Logistics LLC' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Submission #12')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText(/Created Sep 28, 2026/)).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/submissions/12/', expect.anything());
  });

  it('shows the summary and the notes, newest first as the API orders them', async () => {
    await renderLoaded(
      buildDetail({
        notes: [
          {
            id: 2,
            authorName: 'Sam Rivera',
            body: 'Loss runs received.',
            createdAt: '2026-09-30T09:00:00Z',
          },
          {
            id: 1,
            authorName: 'Jordan Lee',
            body: 'Asked for loss runs.',
            createdAt: '2026-09-29T09:00:00Z',
          },
        ],
      }),
    );

    expect(section('Summary')).toHaveTextContent(
      'Cyber liability renewal for a regional logistics operator.',
    );
    const notes = within(section('Notes')).getAllByRole('listitem');
    expect(notes).toHaveLength(2);
    expect(notes[0]).toHaveTextContent('Sam Rivera');
    expect(notes[1]).toHaveTextContent('Asked for loss runs.');
  });

  it('shows who is involved, with working email and phone links', async () => {
    await renderLoaded();

    const details = section('Details');
    expect(details).toHaveTextContent('Logistics');
    expect(details).toHaveTextContent('Denver');
    expect(within(details).getByRole('link', { name: 'ops@northwind.test' })).toHaveAttribute(
      'href',
      'mailto:ops@northwind.test',
    );

    const contacts = section('Contacts');
    expect(contacts).toHaveTextContent('Taylor Brooks');
    expect(contacts).toHaveTextContent('Risk Manager');
    expect(within(contacts).getByRole('link', { name: 'taylor@acme.test' })).toHaveAttribute(
      'href',
      'mailto:taylor@acme.test',
    );
    expect(within(contacts).getByRole('link', { name: '(555) 010-2030' })).toHaveAttribute(
      'href',
      'tel:5550102030',
    );
  });

  it('opens documents in a new tab, and never links an unsafe URL', async () => {
    await renderLoaded(
      buildDetail({
        documents: [
          {
            id: 1,
            title: 'Loss runs',
            docType: 'Spreadsheet',
            uploadedAt: '2026-09-29T10:00:00Z',
            fileUrl: 'https://files.example.com/loss-runs.xlsx',
          },
          {
            id: 2,
            title: 'Suspicious file',
            docType: 'Contract',
            uploadedAt: '2026-09-29T10:00:00Z',
            fileUrl: 'javascript:alert(document.cookie)',
          },
        ],
      }),
    );

    const documents = section('Documents');
    const link = within(documents).getByRole('link', { name: /Loss runs/ });
    expect(link).toHaveAttribute('href', 'https://files.example.com/loss-runs.xlsx');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleName('Loss runs (opens in a new tab)');

    expect(within(documents).queryByRole('link', { name: /Suspicious/ })).not.toBeInTheDocument();
    expect(documents).toHaveTextContent('Contract · Uploaded Sep 29, 2026 · Link unavailable');
  });

  it('says plainly when a section is empty', async () => {
    await renderLoaded(buildDetail({ contacts: [], documents: [], notes: [] }));

    expect(section('Contacts')).toHaveTextContent('No contacts on file.');
    expect(section('Documents')).toHaveTextContent('No documents uploaded.');
    expect(section('Notes')).toHaveTextContent('No notes yet.');
  });

  it('collapses long notes behind "Show more"', async () => {
    const { user } = await renderLoaded(
      buildDetail({
        notes: [
          {
            id: 1,
            authorName: 'Sam',
            body: 'Long note. '.repeat(40),
            createdAt: '2026-09-30T09:00:00Z',
          },
        ],
      }),
    );

    const toggle = screen.getByRole('button', { name: 'Show more' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('links back to the list with the filters the user last had', async () => {
    rememberListSearch('status=new&page=2');
    await renderLoaded();

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).getByRole('link', { name: 'Submissions' })).toHaveAttribute(
      'href',
      '/submissions?status=new&page=2',
    );
  });

  it('offers every way to email the broker, each with the submission as the subject', async () => {
    const { user } = await renderLoaded();
    const subject = 'Submission%20%2312%3A%20Acme%20Logistics%20LLC';

    const button = screen.getByRole('button', { name: 'Email broker' });
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    await user.click(button);

    const menu = screen.getByRole('menu', { name: 'Email broker' });
    expect(menu).toHaveTextContent('ops@northwind.test');
    const item = (name: string) =>
      within(menu).getByRole('menuitem', { name: new RegExp(`^${name}`) });
    // A mailto: link only works with a mail app installed, so webmail compose pages are
    // offered too, each in a new tab.
    expect(item('Open in email app')).toHaveAttribute(
      'href',
      `mailto:ops@northwind.test?subject=${subject}`,
    );
    expect(item('Compose in Gmail')).toHaveAttribute(
      'href',
      `https://mail.google.com/mail/?view=cm&fs=1&to=ops%40northwind.test&su=${subject}`,
    );
    expect(item('Compose in Outlook')).toHaveAttribute('target', '_blank');
    expect(item('Compose in Outlook')).toHaveAttribute('rel', 'noopener noreferrer');

    await user.click(item('Copy email address'));
    expect(await screen.findByText('Email address copied')).toBeInTheDocument();
    await expect(navigator.clipboard.readText()).resolves.toBe('ops@northwind.test');
  });

  it('hides "Email broker" when the broker has no address on file', async () => {
    await renderLoaded(buildDetail({ broker: buildBroker({ primaryContactEmail: null }) }));
    expect(screen.queryByRole('button', { name: 'Email broker' })).not.toBeInTheDocument();
  });

  it('copies the page link and contact emails, confirming each', async () => {
    const { user } = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(await screen.findByText('Link copied')).toBeInTheDocument();
    await expect(navigator.clipboard.readText()).resolves.toBe(window.location.href);

    await user.click(screen.getByRole('button', { name: "Copy Taylor Brooks's email" }));
    await expect(navigator.clipboard.readText()).resolves.toBe('taylor@acme.test');
  });

  it('says when the submission does not exist, with a way back', async () => {
    rememberListSearch('priority=high');
    get.mockRejectedValue(httpError(404, { detail: 'Not found.' }));
    renderWithProviders(<SubmissionDetailView id={999} />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Submission #999 not found' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to submissions' })).toHaveAttribute(
      'href',
      '/submissions?priority=high',
    );
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('offers a retry when loading fails, and recovers', async () => {
    get.mockRejectedValueOnce(networkError()).mockResolvedValue({ data: buildDetail({ id: 12 }) });
    const { user } = renderWithProviders(<SubmissionDetailView id={12} />);

    expect(
      await screen.findByRole('heading', { level: 1, name: "Couldn't load this submission" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Acme Logistics LLC' }),
    ).toBeInTheDocument();
  });

  it('has no detectable accessibility problems', async () => {
    const { container } = await renderLoaded();
    expect(await axe(container)).toHaveNoViolations();
  });
});
