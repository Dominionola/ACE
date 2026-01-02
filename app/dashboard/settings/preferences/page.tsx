import { Sliders, Clock, Bell, Palette } from "lucide-react";

export default function PreferencesPage() {
    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-xl">
                        <Sliders className="h-6 w-6 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-ace-blue tracking-tight">
                        Preferences
                    </h1>
                </div>
                <p className="text-ace-blue/60 mt-2 text-lg">
                    Customize your study experience.
                </p>
            </header>

            <div className="space-y-6">
                {/* Study Settings */}
                <div className="bg-white rounded-3xl border border-ace-blue/10 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="h-5 w-5 text-ace-blue" />
                        <h2 className="font-serif text-lg text-ace-blue">Study Settings</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                            <div>
                                <p className="font-medium text-ace-blue">Default Focus Duration</p>
                                <p className="text-sm text-ace-blue/60">Time for each study session</p>
                            </div>
                            <select className="p-2 border border-ace-blue/20 rounded-lg bg-white text-ace-blue">
                                <option value="25">25 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">60 minutes</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                            <div>
                                <p className="font-medium text-ace-blue">Break Duration</p>
                                <p className="text-sm text-ace-blue/60">Time between sessions</p>
                            </div>
                            <select className="p-2 border border-ace-blue/20 rounded-lg bg-white text-ace-blue">
                                <option value="5">5 minutes</option>
                                <option value="10">10 minutes</option>
                                <option value="15">15 minutes</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-3xl border border-ace-blue/10 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="h-5 w-5 text-ace-blue" />
                        <h2 className="font-serif text-lg text-ace-blue">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                            <div>
                                <p className="font-medium text-ace-blue">Study Reminders</p>
                                <p className="text-sm text-ace-blue/60">Daily reminder to study</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ace-blue"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                            <div>
                                <p className="font-medium text-ace-blue">Exam Alerts</p>
                                <p className="text-sm text-ace-blue/60">Notify before upcoming exams</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ace-blue"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="bg-white rounded-3xl border border-ace-blue/10 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Palette className="h-5 w-5 text-ace-blue" />
                        <h2 className="font-serif text-lg text-ace-blue">Appearance</h2>
                    </div>

                    <div className="p-4 bg-cream-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-ace-blue">Theme</p>
                                <p className="text-sm text-ace-blue/60">Choose your color scheme</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="h-8 w-8 rounded-full bg-cream-50 border-2 border-ace-blue ring-2 ring-ace-blue/20" title="Light" />
                                <button className="h-8 w-8 rounded-full bg-slate-800 border-2 border-transparent opacity-50" title="Dark (Coming Soon)" disabled />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                <p className="text-center text-sm text-ace-blue/50">
                    Preference saving coming soon.
                </p>            </div>
        </div>
    );
}
