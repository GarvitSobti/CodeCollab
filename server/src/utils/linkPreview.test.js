jest.mock('axios', () => ({
  get: jest.fn(),
}));

const axios = require('axios');
const { fetchLinkPreview } = require('./linkPreview');

describe('fetchLinkPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('extracts title, description, and image metadata from HTML', async () => {
    axios.get.mockResolvedValue({
      data: `
        <html>
          <head>
            <meta property="og:title" content="CodeCollab Preview" />
            <meta property="og:description" content="Find your next teammate." />
            <meta property="og:image" content="https://example.com/preview.png" />
            <title>Fallback Title</title>
          </head>
        </html>
      `,
    });

    const preview = await fetchLinkPreview('https://example.com/hackathon');

    expect(preview).toEqual({
      url: 'https://example.com/hackathon',
      hostname: 'example.com',
      title: 'CodeCollab Preview',
      description: 'Find your next teammate.',
      image: 'https://example.com/preview.png',
    });
  });
});
