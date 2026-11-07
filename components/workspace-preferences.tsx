"use client";

import { createContext, useContext, useEffect, useState, type ElementType, type ReactNode } from "react";
import { Languages, Moon, Sun } from "lucide-react";

type Locale = "ar" | "en";
type Theme = "dark" | "light";

const translations: Record<Locale, Record<string, string>> = {
  ar: {
    language: "اللغة", theme: "المظهر", lightMode: "الوضع الفاتح", darkMode: "الوضع الداكن",
    overview: "نظرة عامة", manageProjects: "إدارة المشاريع", customers: "العملاء",
    contentPortfolio: "المحتوى ومعرض الأعمال", messages: "الرسائل", siteSettings: "إعدادات الموقع",
    auditLog: "سجل العمليات", mainMenu: "القائمة الرئيسية", viewSite: "عرض الموقع",
    adminWorkspace: "مساحة الإدارة", adminRole: "مدير النظام",
    adminSpaceTitle: "مساحة إدارة NOVA", adminSpaceDescription: "تابع العملاء والطلبات والمشروعات ومحتوى الموقع من مكان واحد.",
    portalHome: "لوحتي", myProjects: "مشاريعي", startProject: "ابدأ مشروعًا",
    logout: "تسجيل الخروج", projectConversations: "محادثات المشاريع",
    inboxAuto: "القائمة تتحدث تلقائيًا عند وصول رسائل جديدة.",
    noConversations: "لا توجد محادثات مشاريع حتى الآن.",
    conversationWillAppear: "ستظهر المحادثة هنا عندما يرسل عميل رسالة من صفحة مشروعه.",
    clientChat: "محادثة العميل", conversationWithNova: "المحادثة مع فريق NOVA",
    autoRefresh: "الردود تتحدث تلقائيًا كل 5 ثوانٍ", refreshMessages: "تحديث الرسائل",
    loadingConversation: "جارٍ تحميل المحادثة...", startConversation: "ابدأ المحادثة",
    sendToClient: "أرسل للعميل تحديثًا أو استفسارًا بخصوص المشروع.",
    sendToTeam: "اكتب رسالتك وسيتمكن فريق NOVA من الرد عليك هنا.",
    noMessages: "لا توجد رسائل حتى الآن.", you: "أنت", customer: "العميل",
    novaTeam: "فريق NOVA", messagePlaceholder: "اكتب رسالتك هنا...",
    send: "إرسال الرسالة", max5000: "حتى 5000 حرف", safetyNote: "لا تشارك كلمات المرور أو بيانات الدفع داخل المحادثة.",
    messageLoadError: "تعذر تحميل المحادثة.", messageSendError: "تعذر إرسال الرسالة.",
    customerLabel: "العميل", noMessagesYet: "لا توجد رسائل",
    welcome: "مرحبًا", trackProjects: "تابع مشاريعك وطلباتك من مكان واحد.",
    startNewProject: "ابدأ مشروعًا جديدًا", latestProjects: "أحدث المشاريع",
    notifications: "الإشعارات", noProjectsYet: "لا توجد مشاريع بعد.",
    noProjectRequest: "لم ترسل أي طلب مشروع بعد.", projectDetails: "تفاصيل المشروع",
    projectType: "نوع المشروع", projectDescription: "وصف المشروع",
    projectTracking: "متابعة المشروع", projectTrackingDescription: "تابع مراحل تنفيذ مشروعك خطوة بخطوة.",
    currentStage: "المرحلة الحالية", trackingLog: "سجل التحديثات",
    projectReceived: "تم استلام المشروع", noUpdates: "ستظهر هنا تحديثات الشركة فور إضافتها.",
    cancelledProject: "تم إلغاء المشروع", projectStopped: "تم إيقاف المشروع",
    contactNova: "راجع آخر تحديث بالأسفل أو تواصل مع فريق NOVA لمعرفة التفاصيل.",
    stageReview: "جاري مراجعة الطلب", stageContacted: "تم التواصل معك",
    stageStarting: "جاري بدء العمل", stageDesign: "مرحلة التصميم",
    stageDevelopment: "مرحلة التطوير", stageTesting: "الاختبار والمراجعة",
    stageCompleted: "اكتمل المشروع", stageDelivered: "تم التسليم",
    stageNewHint: "تم تسجيل طلبك بنجاح.", stageReviewHint: "نراجع تفاصيل ومتطلبات المشروع.",
    stageContactedHint: "فريقنا يتابع معك التفاصيل والاتفاق.",
    stageStartingHint: "تم الاتفاق والبدء في تنفيذ المشروع.",
    stageDesignHint: "نعمل على تصميم تجربة المشروع.",
    stageDevelopmentHint: "يتم تنفيذ وبناء المشروع.",
    stageTestingHint: "نراجع التفاصيل ونتأكد من جودة العمل.",
    stageCompletedHint: "انتهى تنفيذ المشروع.", stageDeliveredHint: "تم تسليم المشروع إليك.",
    currentPhase: "المرحلة الحالية", updatesAvailable: "التحديثات المسجلة",
    cancelledDetails: "تم إلغاء المشروع.", customerUpdatesSoon: "ستظهر هنا تحديثات الشركة فور إضافتها.",
    adminDashboardEyebrow: "مساحة العمل الإدارية", dashboardTitle: "لوحة التحكم",
    dashboardDescription: "نظرة شاملة على نشاط NOVA وأحدث ما يحدث في منصتك.",
    followRequests: "متابعة الطلبات", totalCustomers: "إجمالي العملاء",
    customerAccounts: "حسابات العملاء", allProjects: "كل المشاريع",
    allRequests: "جميع الطلبات والمشروعات", newRequests: "طلبات جديدة",
    needsReview: "تحتاج إلى مراجعة", activeProjects: "مشاريع نشطة",
    workingNow: "قيد العمل حاليًا", completedDelivered: "مكتملة / تم التسليم",
    done: "تم إنجازها", pendingInvoices: "فواتير معلقة",
    needsFollowUp: "تحتاج إلى متابعة", latestProjectOrders: "أحدث المشاريع والطلبات",
    latestProjectOrdersHint: "آخر الطلبات المسجلة في قاعدة البيانات",
    viewAll: "عرض الكل", noProjectsDashboard: "لا توجد مشاريع حتى الآن. ستظهر الطلبات الجديدة هنا.",
    adminShortcuts: "اختصارات الإدارة", adminShortcutsHint: "انتقل مباشرة إلى الأقسام الأساسية",
    manageCustomers: "إدارة العملاء", manageAndTrackProjects: "إدارة ومتابعة المشاريع",
    updateProjectStageHint: "حدّث مرحلة كل مشروع وأضف رسالة تظهر للعميل في سجل المتابعة الخاص به.",
    projectTrackingPath: "مسار متابعة المشروع", projectStatus: "حالة المشروع الحالية",
    quickClientUpdate: "تحديث سريع للعميل", optionalMilestone: "اختر مرحلة أو تحديثًا (اختياري)",
    updateDetails: "تفاصيل التحديث التي ستظهر للعميل",
    updateExample: "مثال: تم التواصل معك ومراجعة المتطلبات، ونعمل حاليًا على تأكيد تفاصيل التنفيذ.",
    saveAndNotify: "حفظ وإشعار العميل", saving: "جارٍ الحفظ...",
    saveProgress: "جارٍ حفظ المتابعة...", savedAndNotified: "تم تحديث متابعة المشروع وإشعار العميل.",
    changeStatusOrNote: "غيّر الحالة أو أضف تحديثًا قبل الحفظ.",
    titleAndBodyTogether: "اكتب عنوان التحديث وتفاصيله معًا.",
    statusAutoLog: "تغيير الحالة يسجل خطوة تلقائيًا في سجل المتابعة. ويمكنك إضافة تحديث مستقل للعميل.",
    latestUpdates: "آخر التحديثات المسجلة", previousUpdatesEmpty: "لا توجد تحديثات سابقة.",
    noProjectsToTrack: "لا توجد مشاريع لمتابعتها حتى الآن.", updateCount: "تحديث",
    stageReceived: "تم استلام المشروع",
    stageContactedCustomer: "تم التواصل مع العميل", agreementDetails: "تم الاتفاق على تفاصيل المشروع", budgetSchedule: "تم تأكيد الميزانية وموعد التنفيذ", designDone: "تم الانتهاء من التصميم", developmentStarted: "بدأت مرحلة التطوير", testingProgress: "جاري الاختبار والمراجعة", projectDone: "تم الانتهاء من المشروع", projectDelivered: "تم تسليم المشروع", stageStartingWork: "جاري بدء العمل",
    stageDesignDone: "تم الانتهاء من التصميم", stageDevelopmentStarted: "بدأت مرحلة التطوير",
    stageTestingProgress: "جاري الاختبار والمراجعة", stageProjectDone: "تم الانتهاء من المشروع",
    stageProjectDelivered: "تم تسليم المشروع", stageCancelled: "تم إلغاء المشروع",
    stageDesignLabel: "مرحلة التصميم", stageDevelopmentLabel: "مرحلة التطوير",
    stageTestingLabel: "الاختبار والمراجعة", stageCompleteLabel: "اكتمل المشروع",
    projectsTitle: "إدارة ومتابعة المشاريع", customerPageTitle: "العملاء",
    contentTitle: "إدارة المحتوى", settingsTitle: "إعدادات الموقع", auditTitle: "سجل العمليات",
    messagesTitle: "الرسائل والاستفسارات", directCustomerChat: "مراسلة العملاء مباشرة",
    directChatDescription: "محادثة مستقلة لكل مشروع بين العميل وفريق NOVA.",
    contactRequests: "طلبات التواصل", assistantChats: "محادثات المساعد",
    noContactRequests: "لا توجد استفسارات.", noAssistantChats: "لا توجد محادثات محفوظة.",
    name: "الاسم", email: "البريد", phone: "الهاتف", projects: "المشاريع",
    registrationDate: "تاريخ التسجيل", noCustomers: "لا يوجد عملاء بعد.",
    noAuditEvents: "لا توجد عمليات مسجلة بعد.", system: "System",
    contentLibrary: "مكتبة نماذج المعرض", sampleLibraryHint: "إضافة نماذج تجريبية بصور وفيديوهات. ستظهر في المعرض ومعلّمة بوضوح كنماذج غير حقيقية.", addSamples: "إضافة 12 نموذجًا تجريبيًا",
    addContentManually: "إضافة محتوى يدويًا", portfolioWork: "عمل في المعرض",
    service: "خدمة", plan: "باقة", shortSlug: "رابط مختصر slug", workName: "اسم العمل",
    shortDescription: "وصف مختصر", coverImageUrl: "رابط صورة الغلاف (اختياري)",
    videoUrl: "رابط فيديو MP4 مباشر (اختياري)", add: "إضافة", hidePublish: "إخفاء/نشر",
    delete: "حذف", hidden: "مخفي", published: "منشور", demoSample: "نموذج تجريبي",
    adding: "جارٍ التنفيذ…", contentAdded: "تمت الإضافة.", contentRemoved: "تم الحذف.",
    contentUpdated: "تم تحديث الحالة.", sampleSeedConfirm: "إضافة 12 نموذجًا تجريبيًا للمعرض؟",
    deleteConfirm: "تأكيد حذف العنصر نهائيًا؟", addSettings: "إضافة / تعديل إعداد", jsonValue: "قيمة JSON",
    settingKey: "مفتاح الإعداد", saveSetting: "حفظ الإعداد", edit: "تعديل",
    validJson: "اكتب قيمة JSON صحيحة.", saved: "تم الحفظ.",
    allClients: "جميع العملاء", newRequest: "طلب جديد", underReview: "قيد المراجعة",
    awaitingApproval: "بانتظار الموافقة", inProgress: "قيد التنفيذ", completed: "مكتمل",
    delivered: "تم التسليم", cancelled: "ملغي", projectStatusLabel: "حالة المشروع",
    projectName: "اسم المشروع", reference: "رقم المشروع", noRecords: "لا توجد بيانات بعد."
  },
  en: {
    language: "Language", theme: "Theme", lightMode: "Light mode", darkMode: "Dark mode",
    overview: "Overview", manageProjects: "Projects", customers: "Customers",
    contentPortfolio: "Content & portfolio", messages: "Messages", siteSettings: "Site settings",
    auditLog: "Activity log", mainMenu: "Main menu", viewSite: "View website",
    adminWorkspace: "ADMIN WORKSPACE", adminRole: "System administrator",
    adminSpaceTitle: "NOVA administration", adminSpaceDescription: "Manage customers, requests, projects, and website content in one place.",
    portalHome: "My dashboard", myProjects: "My projects", startProject: "Start a project",
    logout: "Sign out", projectConversations: "Project conversations",
    inboxAuto: "The inbox refreshes automatically when new messages arrive.",
    noConversations: "There are no project conversations yet.",
    conversationWillAppear: "A conversation will appear here when a customer messages from their project page.",
    clientChat: "Customer chat", conversationWithNova: "Chat with the NOVA team",
    autoRefresh: "Messages refresh automatically every 5 seconds", refreshMessages: "Refresh messages",
    loadingConversation: "Loading conversation...", startConversation: "Start a conversation",
    sendToClient: "Send the customer a project update or question.",
    sendToTeam: "Write a message and the NOVA team will reply here.",
    noMessages: "No messages yet.", you: "You", customer: "Customer",
    novaTeam: "NOVA team", messagePlaceholder: "Write your message...",
    send: "Send message", max5000: "Up to 5,000 characters", safetyNote: "Do not share passwords or payment details in this chat.",
    messageLoadError: "Unable to load the conversation.", messageSendError: "Unable to send the message.",
    customerLabel: "Customer", noMessagesYet: "No messages",
    welcome: "Welcome", trackProjects: "Track your projects and requests in one place.",
    startNewProject: "Start a new project", latestProjects: "Latest projects",
    notifications: "Notifications", noProjectsYet: "No projects yet.",
    noProjectRequest: "You have not submitted a project request yet.", projectDetails: "Project details",
    projectType: "Project type", projectDescription: "Project description",
    projectTracking: "Project progress", projectTrackingDescription: "Follow each stage of your project step by step.",
    currentStage: "Current stage", trackingLog: "Update history",
    projectReceived: "Project received", noUpdates: "Company updates will appear here as soon as they are added.",
    cancelledProject: "Project cancelled", projectStopped: "Project stopped",
    contactNova: "Review the latest update below or contact the NOVA team for details.",
    stageReview: "Request under review", stageContacted: "We contacted you",
    stageStarting: "Work is starting", stageDesign: "Design",
    stageDevelopment: "Development", stageTesting: "Testing & review",
    stageCompleted: "Project completed", stageDelivered: "Project delivered",
    stageNewHint: "Your request has been received successfully.", stageReviewHint: "We are reviewing your project requirements.",
    stageContactedHint: "Our team is following up with you on the details and agreement.",
    stageStartingHint: "The scope is agreed and implementation is starting.",
    stageDesignHint: "We are designing your project experience.",
    stageDevelopmentHint: "Your project is being built.",
    stageTestingHint: "We are checking the details and quality.",
    stageCompletedHint: "Implementation is complete.", stageDeliveredHint: "Your project has been delivered.",
    currentPhase: "Current stage", updatesAvailable: "Recorded updates",
    cancelledDetails: "This project has been cancelled.", customerUpdatesSoon: "Company updates will appear here when added.",
    adminDashboardEyebrow: "ADMIN WORKSPACE", dashboardTitle: "Dashboard",
    dashboardDescription: "An overview of NOVA activity and the latest updates across your platform.",
    followRequests: "Track requests", totalCustomers: "Total customers",
    customerAccounts: "Customer accounts", allProjects: "All projects",
    allRequests: "All project requests", newRequests: "New requests",
    needsReview: "Need review", activeProjects: "Active projects",
    workingNow: "Currently in progress", completedDelivered: "Completed / delivered",
    done: "Successfully finished", pendingInvoices: "Pending invoices",
    needsFollowUp: "Need follow-up", latestProjectOrders: "Latest projects and requests",
    latestProjectOrdersHint: "Most recently submitted project requests",
    viewAll: "View all", noProjectsDashboard: "No projects yet. New requests will appear here.",
    adminShortcuts: "Admin shortcuts", adminShortcutsHint: "Jump to the main sections",
    manageCustomers: "Manage customers", manageAndTrackProjects: "Project management & tracking",
    updateProjectStageHint: "Update each project's stage and add a message to the customer's progress history.",
    projectTrackingPath: "Project progress", projectStatus: "Current project status",
    quickClientUpdate: "Quick customer update", optionalMilestone: "Choose a milestone or update (optional)",
    updateDetails: "Update details visible to the customer",
    updateExample: "Example: We contacted you and reviewed the requirements. We are confirming the implementation details.",
    saveAndNotify: "Save & notify customer", saving: "Saving...",
    saveProgress: "Saving progress...", savedAndNotified: "Project progress updated and customer notified.",
    changeStatusOrNote: "Change the status or add an update before saving.",
    titleAndBodyTogether: "Enter both an update title and its details.",
    statusAutoLog: "Changing the status automatically adds a timeline entry. You can also add a separate customer update.",
    latestUpdates: "Latest recorded updates", previousUpdatesEmpty: "No previous updates.",
    noProjectsToTrack: "There are no projects to track yet.", updateCount: "updates",
    stageReceived: "Project received",
    stageContactedCustomer: "Customer contacted", agreementDetails: "Project details agreed", budgetSchedule: "Budget and timeline confirmed", designDone: "Design completed", developmentStarted: "Development started", testingProgress: "Testing and review in progress", projectDone: "Project completed", projectDelivered: "Project delivered", stageStartingWork: "Work is starting",
    stageDesignDone: "Design completed", stageDevelopmentStarted: "Development started",
    stageTestingProgress: "Testing and review in progress", stageProjectDone: "Project completed",
    stageProjectDelivered: "Project delivered", stageCancelled: "Project cancelled",
    stageDesignLabel: "Design stage", stageDevelopmentLabel: "Development stage",
    stageTestingLabel: "Testing & review", stageCompleteLabel: "Project completed",
    projectsTitle: "Project management & tracking", customerPageTitle: "Customers",
    contentTitle: "Content management", settingsTitle: "Website settings", auditTitle: "Activity log",
    messagesTitle: "Messages & inquiries", directCustomerChat: "Direct customer messaging",
    directChatDescription: "A separate conversation for each project between the customer and NOVA.",
    contactRequests: "Contact requests", assistantChats: "Assistant conversations",
    noContactRequests: "There are no inquiries.", noAssistantChats: "There are no saved conversations.",
    name: "Name", email: "Email", phone: "Phone", projects: "Projects",
    registrationDate: "Registration date", noCustomers: "No customers yet.",
    noAuditEvents: "No activity has been recorded yet.", system: "System",
    contentLibrary: "Portfolio sample library", sampleLibraryHint: "Add demo images and videos to the portfolio. They will be clearly marked as sample work.", addSamples: "Add 12 demo samples",
    addContentManually: "Add content manually", portfolioWork: "Portfolio item",
    service: "Service", plan: "Plan", shortSlug: "Short slug", workName: "Item name",
    shortDescription: "Short description", coverImageUrl: "Cover image URL (optional)",
    videoUrl: "Direct MP4 video URL (optional)", add: "Add", hidePublish: "Hide / publish",
    delete: "Delete", hidden: "Hidden", published: "Published", demoSample: "Demo sample",
    adding: "Working…", contentAdded: "Added.", contentRemoved: "Deleted.",
    contentUpdated: "Status updated.", sampleSeedConfirm: "Add 12 demo portfolio samples?",
    deleteConfirm: "Permanently delete this item?", addSettings: "Add / edit setting", jsonValue: "JSON value",
    settingKey: "Setting key", saveSetting: "Save setting", edit: "Edit",
    validJson: "Enter valid JSON.", saved: "Saved.",
    allClients: "All customers", newRequest: "New request", underReview: "Under review",
    awaitingApproval: "Awaiting approval", inProgress: "In progress", completed: "Completed",
    delivered: "Delivered", cancelled: "Cancelled", projectStatusLabel: "Project status",
    projectName: "Project name", reference: "Project reference", noRecords: "No data yet."
  }
};

type WorkspaceContextValue = {
  locale: Locale;
  theme: Theme;
  t: (key: string) => string;
  toggleLocale: () => void;
  toggleTheme: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  locale: "ar",
  theme: "dark",
  t: key => translations.ar[key] ?? key,
  toggleLocale: () => undefined,
  toggleTheme: () => undefined
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("nova-workspace-language");
    if (storedLocale === "ar" || storedLocale === "en") setLocale(storedLocale);
    const storedTheme = document.documentElement.dataset.theme;
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);

    const syncTheme = (event: StorageEvent) => {
      if (event.key === "nova-theme" && (event.newValue === "light" || event.newValue === "dark")) {
        setTheme(event.newValue);
      }
      if (event.key === "nova-workspace-language" && (event.newValue === "ar" || event.newValue === "en")) {
        setLocale(event.newValue);
      }
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  function toggleLocale() {
    const next: Locale = locale === "ar" ? "en" : "ar";
    setLocale(next);
    window.localStorage.setItem("nova-workspace-language", next);
    document.cookie = `nova-workspace-language=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem("nova-theme", next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.dispatchEvent(new Event("nova-preferences-change"));
  }

  const value: WorkspaceContextValue = {
    locale,
    theme,
    t: key => translations[locale][key] ?? translations.ar[key] ?? key,
    toggleLocale,
    toggleTheme
  };

  return (
    <WorkspaceContext.Provider value={value}>
      <div className="workspace-locale-root" data-workspace-language={locale} lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
        {children}
      </div>
    </WorkspaceContext.Provider>
  );
}

export function useWorkspacePreferences() {
  return useContext(WorkspaceContext);
}

export function WorkspaceControls() {
  const { locale, theme, toggleLocale, toggleTheme, t } = useWorkspacePreferences();
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <div className="flex items-center gap-2" aria-label={t("theme")}>
      <button
        type="button"
        onClick={toggleLocale}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
        aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
        title={t("language")}
      >
        <Languages size={15} />
        <span>{locale === "ar" ? "EN" : "عربي"}</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
        aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
        title={t("theme")}
      >
        <ThemeIcon size={15} />
        <span className="hidden sm:inline">{theme === "dark" ? t("lightMode") : t("darkMode")}</span>
      </button>
    </div>
  );
}

type WorkspaceTextProps = {
  ar: string;
  en: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "th" | "label" | "div";
  className?: string;
};

export function WorkspaceText({ ar, en, as = "span", className }: WorkspaceTextProps) {
  const { locale } = useWorkspacePreferences();
  const Tag = as as ElementType;
  return <Tag className={className}>{locale === "ar" ? ar : en}</Tag>;
}


export function WorkspaceValue({ value, className }: { value: unknown; className?: string }) {
  const { locale } = useWorkspacePreferences();
  let result = "";
  if (typeof value === "string") {
    result = value;
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferred = record[locale];
    const fallback = record.ar ?? record.en;
    result = typeof preferred === "string" ? preferred : typeof fallback === "string" ? fallback : "";
  }
  return <span className={className}>{result}</span>;
}

const statusTranslationKeys: Record<string, string> = {
  NEW_REQUEST: "newRequest",
  UNDER_REVIEW: "underReview",
  AWAITING_APPROVAL: "awaitingApproval",
  IN_PROGRESS: "inProgress",
  DESIGN_STAGE: "stageDesignLabel",
  DEVELOPMENT_STAGE: "stageDevelopmentLabel",
  TESTING: "stageTestingLabel",
  COMPLETED: "completed",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
};

export function WorkspaceStatus({ status, className }: { status: string; className?: string }) {
  const { t } = useWorkspacePreferences();
  return <span className={className}>{t(statusTranslationKeys[status] ?? status)}</span>;
}
