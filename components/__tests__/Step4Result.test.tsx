import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Step4Result from '../Step4Result';
import { GenerationResult } from '../../types';

// Mock GenerationResult data
const mockResult: GenerationResult = {
  score: 10,
  level: 'Super-tonttu',
  elfSummary: 'Test Summary',
  elfText: 'Test full text',
  elfImageDataUrl: 'data:image/png;base64,fakeimage',
  badgeImageUrl: 'fake-badge-url',
  pdfDataUri: 'data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogCjw8CiAgL1R5cGUgL1BhZ2VzCiAgL01lZGlhQm94IFsgMCAwIDIwMCAyMDAgXQogIC9Db3VudCAxCiAgL0tpZHMgWyAzIDAgUiBdCj4+CmVuZG9iagoKMyAwIG9iago8PAogIC9UeXBlIC9QYWdlCiAgL1BhcmVudCAyIDAgUHIKICAvUmVzb3VyY2VzIDw8CiAgICAvRm9udCA8PAogICAgICAvRjEgNCAwIFIKICAgID4+CiAgPj4KICAvQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8CiAgL1R5cGUgL0ZvbnQKICAvU3VidHlwZSAvVHlwZTEKICAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuCj4+CmVuZG9iagoKNSAwIG9iago8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMjU1IDAwMDAwIG4gCjAwMDAwMDAzMDUgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzY2CiUlRU9GCg==',
  badgeStatus: 'success'
};

describe('Step4Result Component', () => {
  it('renders the result information correctly', () => {
    render(<Step4Result result={mockResult} onReset={() => {}} />);
    
    expect(screen.getByText('Onnittelut!')).toBeInTheDocument();
    expect(screen.getByText('Super-tonttu')).toBeInTheDocument();
    expect(screen.getByText('Test Summary')).toBeInTheDocument();
  });

  it('renders the download link with correct attributes when PDF data is present', () => {
    render(<Step4Result result={mockResult} onReset={() => {}} />);
    
    const downloadLink = screen.getByRole('link', { name: /Lataa PDF/i });
    
    // Check that the href matches the PDF data URI
    expect(downloadLink).toHaveAttribute('href', mockResult.pdfDataUri);
    
    // Check that the download attribute is set (triggers download behavior)
    expect(downloadLink).toHaveAttribute('download', 'joulutodistus.pdf');
  });

  it('does not crash with different PDF content', () => {
    const alternateResult = {
      ...mockResult,
      pdfDataUri: 'data:application/pdf;base64,DIFFERENT_CONTENT'
    };
    
    render(<Step4Result result={alternateResult} onReset={() => {}} />);
    
    const downloadLink = screen.getByRole('link', { name: /Lataa PDF/i });
    expect(downloadLink).toHaveAttribute('href', 'data:application/pdf;base64,DIFFERENT_CONTENT');
  });

  it('does not render download button if pdfDataUri is missing', () => {
    const noPdfResult = { ...mockResult, pdfDataUri: undefined };
    
    render(<Step4Result result={noPdfResult} onReset={() => {}} />);
    
    // queryByRole returns null if not found (getByRole would throw error)
    const downloadLink = screen.queryByRole('link', { name: /Lataa PDF/i });
    expect(downloadLink).not.toBeInTheDocument();
  });

  it('calls onReset when start over button is clicked', () => {
    const handleReset = vi.fn();
    render(<Step4Result result={mockResult} onReset={handleReset} />);
    
    const resetButton = screen.getByText('Aloita alusta');
    fireEvent.click(resetButton);
    
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
