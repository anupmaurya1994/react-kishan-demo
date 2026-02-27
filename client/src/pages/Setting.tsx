import { useState, useEffect } from "react";
import AppHeader from "../pages/AppHeader";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "../hooks/use-toast";

export default function Setting() {
    const [activeTab, setActiveTab] = useState("personal");
    const [isLoading, setIsLoading] = useState(false);

    // Profile state
    const [profileFields, setProfileFields] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const [profileErrors, setProfileErrors] = useState({
        firstName: "",
        lastName: "",
    });

    // Password state
    const [passwordFields, setPasswordFields] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            // In the existing app, user object has a "name" property (firstName + lastName)
            // and an "email" property. We'll try to split the name if possible, 
            // but ideally the backend sends firstName and lastName separately.
            const nameParts = user.name ? user.name.split(" ") : ["", ""];
            setProfileFields({
                firstName: user.firstName || nameParts[0] || "",
                lastName: user.lastName || nameParts.slice(1).join(" ") || "",
                email: user.email || "",
            });
        }
    }, []);

    const validateProfileForm = () => {
        let errors = { firstName: "", lastName: "" };
        let isValid = true;

        if (!profileFields.firstName.trim()) {
            errors.firstName = "First name is required";
            isValid = false;
        }

        if (!profileFields.lastName.trim()) {
            errors.lastName = "Last name is required";
            isValid = false;
        }

        setProfileErrors(errors);
        return isValid;
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateProfileForm()) return;

        setIsLoading(true);
        try {
            const response = await fetch("http://192.168.1.13:5000/api/auth/edit-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    firstName: profileFields.firstName,
                    lastName: profileFields.lastName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            // Update local storage
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const updatedUser = {
                ...storedUser,
                name: `${data.firstName} ${data.lastName}`,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            toast({
                title: "Success! 🎉",
                description: "Your profile has been updated.",
            });
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const validatePasswordForm = () => {
        let errors = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };
        let isValid = true;

        if (!passwordFields.currentPassword.trim()) {
            errors.currentPassword = "Current password is required";
            isValid = false;
        }

        if (!passwordFields.newPassword.trim()) {
            errors.newPassword = "New password is required";
            isValid = false;
        } else if (passwordFields.newPassword.length < 6) {
            errors.newPassword = "Password must be at least 6 characters";
            isValid = false;
        }

        if (!passwordFields.confirmPassword.trim()) {
            errors.confirmPassword = "Please confirm your password";
            isValid = false;
        } else if (passwordFields.newPassword !== passwordFields.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        if (passwordFields.newPassword === passwordFields.currentPassword && passwordFields.newPassword !== "") {
            errors.newPassword = "New password must be different from current password";
            isValid = false;
        }

        setPasswordErrors(errors);
        return isValid;
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePasswordForm()) return;

        setIsLoading(true);
        try {
            const response = await fetch("http://192.168.1.13:5000/api/auth/edit-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    currentPassword: passwordFields.currentPassword,
                    newPassword: passwordFields.newPassword,
                    confirmPassword: passwordFields.confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update password");
            }

            toast({
                title: "Success! 🔐",
                description: "Your password has been updated successfully.",
            });

            // Clear password fields
            setPasswordFields({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AppHeader />

            <div className="min-h-screen bg-gray-50/50 py-16">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Account Settings
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Manage your profile information and security settings.
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="px-8 mt-6">
                            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
                                <button
                                    onClick={() => setActiveTab("personal")}
                                    className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "personal"
                                        ? "bg-white shadow-sm text-primary"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                        }`}
                                >
                                    Personal Info
                                </button>

                                <button
                                    onClick={() => setActiveTab("password")}
                                    className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "password"
                                        ? "bg-white shadow-sm text-primary"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                        }`}
                                >
                                    Password & Security
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-10">

                            {/* PERSONAL TAB */}
                            {activeTab === "personal" && (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileFields.firstName}
                                                onChange={(e) => setProfileFields({ ...profileFields, firstName: e.target.value })}
                                                placeholder="Enter first name"
                                                className={`w-full px-4 py-2.5 rounded-xl border ${profileErrors.firstName ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:border-primary/50 focus:ring-primary/10'} bg-white focus:ring-4 outline-none transition-all duration-200`}
                                            />
                                            {profileErrors.firstName && <p className="text-xs text-red-500 font-medium">{profileErrors.firstName}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileFields.lastName}
                                                onChange={(e) => setProfileFields({ ...profileFields, lastName: e.target.value })}
                                                placeholder="Enter last name"
                                                className={`w-full px-4 py-2.5 rounded-xl border ${profileErrors.lastName ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:border-primary/50 focus:ring-primary/10'} bg-white focus:ring-4 outline-none transition-all duration-200`}
                                            />
                                            {profileErrors.lastName && <p className="text-xs text-red-500 font-medium">{profileErrors.lastName}</p>}
                                        </div>

                                        <div className="sm:col-span-2 space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={profileFields.email}
                                                disabled
                                                placeholder="john@example.com"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                                            />
                                            <p className="text-[11px] text-gray-400 italic">Email cannot be changed currently.</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* PASSWORD TAB */}
                            {activeTab === "password" && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">

                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Current Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                type={showPassword.current ? "text" : "password"}
                                                placeholder="Enter current password"
                                                value={passwordFields.currentPassword}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, currentPassword: e.target.value })}
                                                className={`w-full px-4 py-2.5 pr-12 rounded-xl border ${passwordErrors.currentPassword ? "border-red-500 ring-red-100" : "border-gray-200 focus:border-primary/50 focus:ring-primary/10"} bg-white focus:ring-4 outline-none transition-all duration-200`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                {showPassword.current ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                        {passwordErrors.currentPassword && <p className="text-xs text-red-500 font-medium">{passwordErrors.currentPassword}</p>}
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            New Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                type={showPassword.new ? "text" : "password"}
                                                placeholder="Minimum 6 characters"
                                                value={passwordFields.newPassword}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
                                                className={`w-full px-4 py-2.5 pr-12 rounded-xl border ${passwordErrors.newPassword ? "border-red-500 ring-red-100" : "border-gray-200 focus:border-primary/50 focus:ring-primary/10"} bg-white focus:ring-4 outline-none transition-all duration-200`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                {showPassword.new ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                        {passwordErrors.newPassword && <p className="text-xs text-red-500 font-medium">{passwordErrors.newPassword}</p>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Confirm New Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                type={showPassword.confirm ? "text" : "password"}
                                                placeholder="Repeat new password"
                                                value={passwordFields.confirmPassword}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })}
                                                className={`w-full px-4 py-2.5 pr-12 rounded-xl border ${passwordErrors.confirmPassword ? "border-red-500 ring-red-100" : "border-gray-200 focus:border-primary/50 focus:ring-primary/10"} bg-white focus:ring-4 outline-none transition-all duration-200`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                {showPassword.confirm ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                        {passwordErrors.confirmPassword && <p className="text-xs text-red-500 font-medium">{passwordErrors.confirmPassword}</p>}
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                                            {isLoading ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
