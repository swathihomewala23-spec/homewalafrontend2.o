import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setIsNavbarModalOpen } from '../features/BasicSlice';
import { IoMdClose } from 'react-icons/io';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ChangePasswordImage from '../assets/banner.jpeg';
import { api } from '../axiosConfig';
import { FaChevronLeft } from 'react-icons/fa';
import "./ChangePassword.css";

const changePasswordSchema = z.object({
    old_password: z.string().min(8, 'Old Password must be at least 8 characters long'),
    new_password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
});

const ChangePassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const modalRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        trigger,
    } = useForm({
        resolver: zodResolver(changePasswordSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            const response = await api.post('/buyer/change-password', data);
            console.log('response', response.data);
            if (response.data.status === 'success') {
                toast.success(response.data.message || 'Password changed successfully!');
                reset();
                navigate(-1);
            }
        } catch (error) {
            console.log('Error response:', error.response?.data);

            if (error.response?.data) {
                if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    toast.error(error.response.data.errors[0]);
                } else if (error.response.data.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error('Failed to change password. Please try again.');
                }
            } else {
                toast.error('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                navigate(-1);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [navigate]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                navigate(-1);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);

    return (
        <div>
           <div className="change-password-page">
                <div ref={modalRef} className="change-password-card">
                    <div className="change-password-content">
                       
                        <h1>Change Password</h1>
                        <p className="change-password-desc">Don't worry, happens to all of us. Enter your old password below to change your password.</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="change-password-form">
                            <TextField
                                label="Old Password"
                                variant="outlined"
                                fullWidth
                                type={showOldPassword ? 'text' : 'password'}
                                {...register('old_password')}
                                error={!!errors.old_password}
                                helperText={errors.old_password?.message}
                                onBlur={() => trigger('old_password')}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                                                {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="Create Password"
                                variant="outlined"
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                {...register('new_password')}
                                error={!!errors.new_password}
                                helperText={errors.new_password?.message}
                                onBlur={() => trigger('new_password')}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="Re-enter Password"
                                variant="outlined"
                                fullWidth
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirm_password')}
                                error={!!errors.confirm_password}
                                helperText={errors.confirm_password?.message}
                                onBlur={() => trigger('confirm_password')}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </Button>
                        </form>
                    </div>

                   
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
