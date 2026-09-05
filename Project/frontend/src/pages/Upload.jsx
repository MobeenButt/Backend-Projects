import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { videoService } from '../services/video.service';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const MAX_VIDEO_MB = 100;
const MAX_IMAGE_MB = 5;

const formatBytes = (bytes) => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

const Upload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'videoFile' && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video must be under ${MAX_VIDEO_MB} MB`);
      return;
    }
    if (type === 'thumbnail' && file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Thumbnail must be under ${MAX_IMAGE_MB} MB`);
      return;
    }
    if (type === 'thumbnail' && !file.type.startsWith('image/')) {
      toast.error('Thumbnail must be an image file');
      return;
    }
    if (type === 'videoFile' && !file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    setFormData((prev) => ({ ...prev, [type]: file }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video must be under ${MAX_VIDEO_MB} MB`);
      return;
    }
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    setFormData((prev) => ({ ...prev, videoFile: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.videoFile) {
      toast.error('Please select a video file');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    const uploadData = new FormData();
    uploadData.append('title', formData.title.trim());
    uploadData.append('description', formData.description.trim());
    uploadData.append('videoFile', formData.videoFile);
    if (formData.thumbnail) {
      uploadData.append('thumbnail', formData.thumbnail);
    }

    try {
      await videoService.uploadVideo(uploadData);
      toast.success('Video uploaded successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-youtube-text mb-6 tracking-tight">
          Upload Video
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Video File - Drag & Drop */}
          <div
            className={`card-surface p-6 transition-all duration-200 ${
              dragActive ? 'border-youtube-red ring-2 ring-youtube-red/30' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <label className="block text-sm font-medium text-youtube-text mb-3">
              Video File *
            </label>
            <div
              className="border-2 border-dashed border-youtube-border rounded-lg p-8 text-center hover:border-youtube-text-secondary transition-colors cursor-pointer"
              onClick={() => videoInputRef.current?.click()}
            >
              <svg className="w-12 h-12 mx-auto mb-3 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-youtube-text mb-1 font-medium">
                {formData.videoFile
                  ? formData.videoFile.name
                  : 'Drag & drop your video here'}
              </p>
              <p className="text-xs text-youtube-text-secondary">
                or click to browse • MP4, WebM, MOV • up to {MAX_VIDEO_MB} MB
              </p>
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, 'videoFile')}
              className="hidden"
            />
            {formData.videoFile && (
              <p className="mt-3 text-sm text-youtube-text-secondary">
                Selected: {formData.videoFile.name} (
                {formatBytes(formData.videoFile.size)})
              </p>
            )}
          </div>

          {/* Thumbnail */}
          <div className="card-surface p-6">
            <label className="block text-sm font-medium text-youtube-text mb-3">
              Thumbnail
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              {formData.thumbnail && (
                <img
                  src={URL.createObjectURL(formData.thumbnail)}
                  alt="Thumbnail preview"
                  className="w-40 aspect-video object-cover rounded-lg border border-youtube-border"
                />
              )}
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="btn btn-outlined "
              >
                {formData.thumbnail ? 'Change thumbnail' : 'Choose thumbnail'}
              </button>
              {formData.thumbnail && (
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, thumbnail: null }))}
                  className="text-sm text-youtube-text-secondary hover:text-youtube-text transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'thumbnail')}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div className="card-surface p-6">
            <Input
              label="Title *"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter video title"
              maxLength={100}
              required
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-youtube-text mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Tell viewers about your video"
                rows={5}
                maxLength={5000}
                className="input-field resize-none"
              />
              <div className="text-right text-xs text-youtube-text-secondary mt-1">
                {formData.description.length}/5000
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!formData.videoFile || !formData.title.trim()}
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