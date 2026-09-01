import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Upload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.videoFile) {
      toast.error('Please select a video file');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement video upload API call
      toast.success('Video uploaded successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-youtube-text mb-6">Upload Video</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video File */}
          <div className="bg-youtube-surface border border-youtube-border rounded-sm p-6">
            <label className="block text-sm font-medium text-youtube-text mb-3">
              Video File *
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, 'videoFile')}
              className="block w-full text-sm text-youtube-text-secondary
                file:mr-4 file:py-2 file:px-4
                file:rounded-sm file:border-0
                file:text-sm file:font-medium
                file:bg-youtube-red file:text-white
                hover:file:bg-red-700 file:cursor-pointer
                cursor-pointer"
            />
            {formData.videoFile && (
              <p className="mt-2 text-sm text-youtube-text-secondary">
                Selected: {formData.videoFile.name}
              </p>
            )}
          </div>

          {/* Thumbnail */}
          <div className="bg-youtube-surface border border-youtube-border rounded-sm p-6">
            <label className="block text-sm font-medium text-youtube-text mb-3">
              Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'thumbnail')}
              className="block w-full text-sm text-youtube-text-secondary
                file:mr-4 file:py-2 file:px-4
                file:rounded-sm file:border-0
                file:text-sm file:font-medium
                file:bg-youtube-surface file:text-youtube-text
                hover:file:bg-youtube-hover file:cursor-pointer
                cursor-pointer border border-youtube-border rounded-sm"
            />
            {formData.thumbnail && (
              <p className="mt-2 text-sm text-youtube-text-secondary">
                Selected: {formData.thumbnail.name}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <Input
              label="Title *"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter video title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-youtube-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell viewers about your video"
              rows={6}
              className="w-full bg-youtube-bg border border-youtube-border rounded-sm px-3 py-2 text-youtube-text placeholder-youtube-text-secondary focus:outline-none focus:ring-2 focus:ring-youtube-red"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
