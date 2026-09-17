import PdfViewerPage from '@/components/PdfViewerPage';
import { profile } from '@/data/resume';

export default function ResumePage() {
  return (
    <PdfViewerPage
      title="Resume"
      subtitle={`${profile.name} · PDF`}
      documentTitle={`Resume · ${profile.name}`}
      file={profile.resume}
    />
  );
}
