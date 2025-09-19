export const handleDownload = (imageUrl: string) => {
  try {
    // Opening the URL in a new tab to act as a preview page.
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Error opening image in new tab:', error);
    throw error;
  }
};
