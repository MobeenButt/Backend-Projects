import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validateEmail, validatePassword } from '../utils/helpers';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (errors.avatar) {
        setErrors({ ...errors, avatar: '' });
      }
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!avatar) {
      newErrors.avatar = 'Avatar is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      const registrationData = new FormData();
      registrationData.append('fullName', formData.fullName);
      registrationData.append('username', formData.username);
      registrationData.append('email', formData.email);
      registrationData.append('password', formData.password);
      registrationData.append('avatar', avatar);
      if (coverImage) {
        registrationData.append('coverImage', coverImage);
      }

      await register(registrationData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-youtube-bg">
      <div className="w-full max-w-md my-8">
        <div className="bg-youtube-surface border border-youtube-border rounded-sm p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-10 h-10 text-youtube-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.582 6.186s-.152-.999-.618-1.441c-.592-.619-1.254-.622-1.558-.659C16.774 4 12.001 4 12.001 4s-4.773 0-7.405.086c-.304.037-.966.04-1.558.659-.466.442-.619 1.441-.619 1.441S2.254 7.346 2.254 8.505v1.991c0 1.159.165 2.318.165 2.318s.153.999.619 1.441c.592.619 1.368.599 1.714.665 1.244.12 7.199.157 7.199.157s4.778-.005 7.41-.091c.304-.037.966-.04 1.558-.659.466-.442.618-1.441.618-1.441s.165-1.159.165-2.318V8.505c0-1.159-.165-2.319-.165-2.319zM9.996 15.005l.001-6.005 5.75 3.005-5.751 3z"/>
              </svg>
              <span className="text-2xl font-bold text-youtube-text">VidTube</span>
            </div>
            <h1 className="text-2xl font-medium text-youtube-text mb-2">Create your account</h1>
            <p className="text-sm text-youtube-text-secondary">to continue to VidTube</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />

            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-youtube-text mb-2">
                Avatar <span className="text-youtube-red">*</span>
              </label>
              <div className="flex items-center gap-4">
                {avatarPreview && (
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-youtube-surface border-2 border-youtube-border">
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-youtube-border rounded-lg p-4 text-center hover:border-youtube-text-secondary transition-colors">
                    <svg className="w-8 h-8 mx-auto mb-2 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-youtube-text-secondary">
                      {avatar ? avatar.name : 'Click to upload avatar'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.avatar && (
                <p className="mt-1 text-sm text-red-500">{errors.avatar}</p>
              )}
            </div>

            {/* Cover Image Upload (Optional) */}
            <div>
              <label className="block text-sm font-medium text-youtube-text mb-2">
                Cover Image <span className="text-youtube-text-secondary text-xs">(Optional)</span>
              </label>
              <div className="flex flex-col gap-3">
                {coverImagePreview && (
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-youtube-surface border-2 border-youtube-border">
                    <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-youtube-border rounded-lg p-4 text-center hover:border-youtube-text-secondary transition-colors">
                    <svg className="w-8 h-8 mx-auto mb-2 text-youtube-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-youtube-text-secondary">
                      {coverImage ? coverImage.name : 'Click to upload cover image'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Create account
              </Button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-youtube-text-secondary">Already have an account? </span>
            <Link to="/login" className="text-sm text-blue-500 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
