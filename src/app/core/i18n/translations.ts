export const translations: Record<string, { vi: string; en: string }> = {
  // Application & Brand
  'app.name': { vi: 'Shared Lab', en: 'Shared Lab' },
  'app.tagline': { vi: 'Hệ thống Quản lý Lab', en: 'Lab Booking System' },
  'app.workspace': { vi: 'Shared Lab Workspace', en: 'Shared Lab Workspace' },

  // Navigation Groups
  'nav.groups.overview': { vi: 'TỔNG QUAN', en: 'OVERVIEW' },
  'nav.groups.resources': { vi: 'TÀI NGUYÊN', en: 'RESOURCES' },
  'nav.groups.management': { vi: 'QUẢN LÝ VẬN HÀNH', en: 'OPERATIONS' },
  'nav.groups.personal': { vi: 'CÁ NHÂN', en: 'PERSONAL' },
  'nav.groups.systemAdmin': { vi: 'QUẢN TRỊ HỆ THỐNG', en: 'SYSTEM ADMIN' },

  // Navigation Items
  'nav.items.home': { vi: 'Trang chủ', en: 'Home' },
  'nav.items.dashboard': { vi: 'Bảng điều khiển', en: 'Dashboard' },
  'nav.items.calendar': { vi: 'Lịch tài nguyên', en: 'Resource Calendar' },
  'nav.items.labs': { vi: 'Phòng thí nghiệm', en: 'Lab Rooms' },
  'nav.items.equipments': { vi: 'Thiết bị', en: 'Equipment' },
  'nav.items.maintenances': { vi: 'Lịch bảo trì', en: 'Maintenance Schedule' },
  'nav.items.myBookings': { vi: 'Booking của tôi', en: 'My Bookings' },
  'nav.items.myWaitlist': { vi: 'Hàng chờ của tôi', en: 'My Waitlist' },
  'nav.items.pendingBookings': { vi: 'Booking cần duyệt', en: 'Bookings to Approve' },
  'nav.items.manageBookings': { vi: 'Quản lý booking', en: 'Manage Bookings' },
  'nav.items.usageLogs': { vi: 'Nhật ký sử dụng', en: 'Usage Logs' },
  'nav.items.incidents': { vi: 'Duyệt sự cố', en: 'Review Incidents' },
  'nav.items.manageWaitlists': { vi: 'Quản lý hàng chờ', en: 'Manage Waitlists' },
  'nav.items.manageViolations': { vi: 'Quản lý vi phạm', en: 'Manage Violations' },
  'nav.items.reports': { vi: 'Trung tâm báo cáo', en: 'Reports Center' },
  'nav.items.violations': { vi: 'Vi phạm & điểm phạt', en: 'Violations & Penalties' },
  'nav.items.notifications': { vi: 'Thông báo', en: 'Notifications' },
  'nav.items.profile': { vi: 'Hồ sơ cá nhân', en: 'My Profile' },
  'nav.items.policy': { vi: 'Chính sách', en: 'Policy' },
  'nav.items.users': { vi: 'Quản lý người dùng', en: 'User Management' },
  'nav.items.departments': { vi: 'Khoa & Phòng ban', en: 'Departments' },
  'nav.items.priorityRules': { vi: 'Quy tắc ưu tiên', en: 'Priority Rules' },
  'nav.items.sendNotification': { vi: 'Gửi thông báo', en: 'Send Notification' },
  'nav.items.auditLogs': { vi: 'Audit Log', en: 'Audit Log' },
  'nav.items.roles': { vi: 'Danh sách vai trò', en: 'Roles' },

  // User Roles
  'roles.Admin': { vi: 'Quản trị viên hệ thống', en: 'System Admin' },
  'roles.LabManager': { vi: 'Quản lý phòng lab', en: 'Lab Manager' },
  'roles.Requester': { vi: 'Người đặt lịch', en: 'Requester' },

  // Header & Sidebar
  'sidebar.quickBooking': { vi: 'Tạo booking nhanh', en: 'Quick Booking' },
  'sidebar.closeMenu': { vi: 'Đóng menu', en: 'Close Menu' },
  'sidebar.connected': { vi: 'Đã kết nối', en: 'Connected' },
  'sidebar.logout': { vi: 'Đăng xuất', en: 'Logout' },
  'header.viewCalendar': { vi: 'Xem lịch', en: 'View Calendar' },
  'header.notifications': { vi: 'Thông báo', en: 'Notifications' },
  'header.workspace': { vi: 'Shared Lab Workspace', en: 'Shared Lab Workspace' },
  'header.subtitle': {
    vi: 'Quản lý phòng thí nghiệm & thiết bị dùng chung',
    en: 'Manage shared lab rooms & equipment',
  },
  'header.workspaceSub': {
    vi: 'Quản lý phòng thí nghiệm & thiết bị dùng chung',
    en: 'Manage shared lab rooms & equipment',
  },
  'header.connected': { vi: 'Đã kết nối', en: 'Connected' },
  'header.logout': { vi: 'Đăng xuất', en: 'Logout' },

  // Common Actions & Filters
  'common.from': { vi: 'Từ', en: 'From' },
  'common.to': { vi: 'Đến', en: 'To' },
  'common.apply': { vi: 'Áp dụng', en: 'Apply' },
  // Common Actions, Pagination & Form
  'common.search': { vi: 'Tìm kiếm', en: 'Search' },
  'common.all': { vi: 'Tất cả', en: 'All' },
  'common.reset': { vi: 'Đặt lại', en: 'Reset' },
  'common.noData': { vi: 'Chưa có dữ liệu', en: 'No data available' },
  'common.details': { vi: 'Xem chi tiết', en: 'View details' },
  'common.status': { vi: 'Trạng thái', en: 'Status' },
  'common.viewCalendar': { vi: 'Xem lịch', en: 'View Calendar' },
  'common.prev': { vi: 'Trước', en: 'Previous' },
  'common.next': { vi: 'Sau', en: 'Next' },
  'common.page': { vi: 'Trang', en: 'Page' },
  'common.people': { vi: 'người', en: 'people' },
  'common.cancel': { vi: 'Hủy', en: 'Cancel' },
  'common.save': { vi: 'Lưu', en: 'Save' },
  'common.saving': { vi: 'Đang lưu...', en: 'Saving...' },
  'common.create': { vi: 'Tạo mới', en: 'Create' },
  'common.actions': { vi: 'Thao tác', en: 'Actions' },

  // Dashboard translations
  'dashboard.title': { vi: 'Dashboard Tổng quan', en: 'Dashboard Overview' },
  'dashboard.liveData': { vi: 'Dữ liệu vận hành trực tiếp', en: 'Live Operating Data' },
  'dashboard.subtitleAdmin': { vi: 'Toàn bộ hệ thống phòng thí nghiệm', en: 'Entire lab system' },
  'dashboard.subtitleManager': {
    vi: 'Các phòng lab bạn đang quản lý',
    en: 'Labs under your management',
  },
  'dashboard.usageTrend': { vi: 'Xu hướng sử dụng', en: 'Usage Trend' },
  'dashboard.usageTrendSub': {
    vi: 'Số giờ và lượt sử dụng theo thời gian',
    en: 'Usage hours & frequency over time',
  },
  'dashboard.usageLog': { vi: 'Nhật ký sử dụng', en: 'Usage Log' },
  'dashboard.hours': { vi: 'giờ', en: 'hours' },
  'dashboard.bookingStatus': { vi: 'Trạng thái Booking', en: 'Booking Status' },
  'dashboard.bookingStatusSub': {
    vi: 'Phân bố trong khoảng thời gian đã chọn',
    en: 'Distribution in selected period',
  },
  'dashboard.bookingPurpose': { vi: 'Booking theo mục đích', en: 'Bookings by Purpose' },
  'dashboard.bookingPurposeSub': { vi: 'Nhu cầu sử dụng tài nguyên', en: 'Resource usage demand' },
  'dashboard.bookingDepartment': {
    vi: 'Booking theo khoa / phòng ban',
    en: 'Bookings by Department',
  },
  'dashboard.bookingDepartmentSub': {
    vi: 'Đơn vị có nhu cầu sử dụng cao nhất',
    en: 'Units with highest demand',
  },
  'dashboard.resourceEfficiency': { vi: 'Hiệu suất tài nguyên', en: 'Resource Efficiency' },
  'dashboard.resourceEfficiencySub': {
    vi: 'Phòng lab và thiết bị có tỷ lệ sử dụng cao',
    en: 'High utilization labs & equipment',
  },
  'dashboard.resource': { vi: 'Tài nguyên', en: 'Resource' },
  'dashboard.actualHours': { vi: 'Giờ thực tế', en: 'Actual Hours' },
  'dashboard.availableHours': { vi: 'Khả dụng', en: 'Available Hours' },
  'dashboard.utilizationRate': { vi: 'Tỷ lệ sử dụng', en: 'Utilization Rate' },
  'dashboard.totalBookings': { vi: 'Tổng booking', en: 'Total Bookings' },
  'dashboard.totalUsageLogs': { vi: 'Lượt sử dụng', en: 'Total Usage Logs' },
  'dashboard.totalViolations': { vi: 'Vi phạm', en: 'Violations' },
  'dashboard.maintenanceCost': { vi: 'Chi phí bảo trì', en: 'Maintenance Cost' },
  'dashboard.noShowCount': { vi: 'No-show', en: 'No-show Count' },
  'dashboard.noShowRate': { vi: 'Tỷ lệ No-show', en: 'No-show Rate' },
  'dashboard.preset7': { vi: '7 ngày', en: '7 days' },
  'dashboard.preset30': { vi: '30 ngày', en: '30 days' },
  'dashboard.preset90': { vi: '90 ngày', en: '90 days' },
  'dashboard.presetYear': { vi: 'Năm nay', en: 'This year' },
  'dashboard.topPenalizedUsers': {
    vi: 'Người dùng có điểm phạt cao',
    en: 'Users with High Penalty Points',
  },
  'dashboard.topPenalizedSub': {
    vi: 'Ưu tiên theo dõi trong kỳ',
    en: 'Priority monitoring for the period',
  },
  'dashboard.noPenalizedUsers': {
    vi: 'Không có người dùng vi phạm trong kỳ.',
    en: 'No violating users in this period.',
  },
  'dashboard.mostUsedLabs': { vi: 'Phòng lab dùng nhiều nhất', en: 'Most Used Labs' },
  'dashboard.mostUsedLabsSub': {
    vi: 'Xếp hạng theo giờ sử dụng thực tế',
    en: 'Ranked by actual usage hours',
  },
  'dashboard.mostUsedEquipments': { vi: 'Thiết bị dùng nhiều nhất', en: 'Most Used Equipment' },
  'dashboard.mostUsedEquipmentsSub': {
    vi: 'Xếp hạng theo giờ sử dụng thực tế',
    en: 'Ranked by actual usage hours',
  },
  'dashboard.points': { vi: 'điểm', en: 'pts' },
  'dashboard.activeViolations': { vi: 'vi phạm hoạt động', en: 'active violations' },

  // Labs Page
  'labs.title': { vi: 'Không gian phòng thí nghiệm', en: 'Lab Room Workspace' },
  'labs.subtitle': {
    vi: 'Khám phá phòng lab, sức chứa, vị trí và trạng thái tài nguyên trước khi tạo booking.',
    en: 'Explore lab rooms, capacity, location and resource status before booking.',
  },
  'labs.addLab': { vi: '+ Thêm phòng lab', en: '+ Add Lab Room' },
  'labs.searchPlaceholder': {
    vi: 'Tên phòng, mã phòng, vị trí...',
    en: 'Room name, code, location...',
  },
  'labs.minCapacity': { vi: 'Sức chứa tối thiểu', en: 'Minimum Capacity' },
  'labs.viewMode': { vi: 'Kiểu hiển thị', en: 'View Mode' },
  'labs.available': { vi: 'Có thể sử dụng', en: 'Available' },
  'labs.maintenance': { vi: 'Đang bảo trì', en: 'Under Maintenance' },
  'labs.labRoom': { vi: 'Phòng lab', en: 'Lab Room' },
  'labs.location': { vi: 'Vị trí', en: 'Location' },
  'labs.capacity': { vi: 'Sức chứa', en: 'Capacity' },

  // Equipments Page
  'equipments.title': { vi: 'Thiết bị thí nghiệm', en: 'Lab Equipment' },
  'equipments.subtitle': {
    vi: 'Tìm kiếm, kiểm tra trạng thái và đặt lịch các thiết bị dùng chung trong hệ thống.',
    en: 'Search, check status and book shared equipment.',
  },
  'equipments.addEquipment': { vi: '+ Thêm thiết bị', en: '+ Add Equipment' },
  'equipments.searchPlaceholder': { vi: 'Tên thiết bị, model...', en: 'Equipment name, model...' },
  'equipments.ready': { vi: 'Sẵn sàng', en: 'Available' },
  'equipments.inUse': { vi: 'Đang sử dụng', en: 'In Use' },
  'equipments.broken': { vi: 'Bị hỏng', en: 'Broken' },
  'equipments.retired': { vi: 'Ngừng sử dụng', en: 'Retired' },

  // Home Page
  'home.welcome': { vi: 'Chào mừng trở lại', en: 'Welcome back' },
  'home.greeting': {
    vi: 'Chào {name}, sẵn sàng nghiên cứu chưa?',
    en: 'Hi {name}, ready to research?',
  },
  'home.sub': {
    vi: 'Theo dõi lịch đặt, hàng chờ và trạng thái tài khoản của bạn tại một nơi.',
    en: 'Track your bookings, waitlists, and account status in one place.',
  },
  'home.viewCalendar': { vi: 'Xem lịch tài nguyên', en: 'View Resource Calendar' },
  'home.quickBooking': { vi: 'Tạo booking nhanh', en: 'Quick Booking' },
  'home.accountNotice': { vi: 'Tài khoản cần chú ý', en: 'Account Needs Attention' },
  'home.viewDetails': { vi: 'Xem chi tiết', en: 'View Details' },
  'home.pendingApproval': { vi: 'Đang chờ duyệt', en: 'Pending Approval' },
  'home.pendingNote': { vi: 'Booking cần quản lý xử lý', en: 'Bookings awaiting review' },
  'home.upcomingBookings': { vi: 'Sắp diễn ra', en: 'Upcoming' },
  'home.approvedNote': { vi: 'Booking đã được duyệt', en: 'Approved bookings' },
  'home.activeWaitlist': { vi: 'Hàng chờ hoạt động', en: 'Active Waitlists' },
  'home.waitlistNote': { vi: 'Đang giữ vị trí ưu tiên', en: 'Holding priority position' },
  'home.unreadNotifications': { vi: 'Thông báo chưa đọc', en: 'Unread Notifications' },
  'home.unreadNote': { vi: 'Cập nhật mới cần xem', en: 'New updates to check' },
  'home.upcomingTitle': { vi: 'Booking sắp tới', en: 'Upcoming Bookings' },
  'home.upcomingSubtitle': {
    vi: 'Các lịch đã được duyệt và chuẩn bị diễn ra',
    en: 'Approved bookings happening soon',
  },
  'home.viewAll': { vi: 'Xem tất cả', en: 'View All' },
  'home.noUpcoming': { vi: 'Chưa có booking sắp tới', en: 'No upcoming bookings' },
  'home.noUpcomingSub': {
    vi: 'Khi booking được duyệt, lịch sẽ xuất hiện ở đây.',
    en: 'Approved bookings will appear here.',
  },
  'home.accountHealth': { vi: 'Sức khỏe tài khoản', en: 'Account Health' },
  'home.accountHealthSub': {
    vi: 'Cập nhật theo điểm phạt hiện tại',
    en: 'Updated based on current penalties',
  },
  'home.totalPenaltyPoints': { vi: 'Tổng điểm phạt', en: 'Total Penalty Points' },
  'home.restrictionUntil': { vi: 'Hạn chế đến', en: 'Restricted Until' },
  'home.none': { vi: 'Không có', en: 'None' },
  'home.latestNotifications': { vi: 'Thông báo mới nhất', en: 'Latest Notifications' },
  'home.latestNotificationsSub': {
    vi: 'Những cập nhật bạn cần xử lý',
    en: 'Updates requiring your attention',
  },
  'home.notificationCenter': { vi: 'Trung tâm thông báo', en: 'Notification Center' },
  'home.noNotifications': { vi: 'Chưa có thông báo nào.', en: 'No notifications available.' },
  'home.yourWaitlist': { vi: 'Hàng chờ của bạn', en: 'Your Waitlists' },
  'home.waitlistSub': {
    vi: 'Theo dõi vị trí và thời gian được giữ chỗ',
    en: 'Track your position and reserved spot',
  },
  'home.noWaitlists': { vi: 'Không có hàng chờ hoạt động', en: 'No active waitlists' },
  'home.inWaitlist': { vi: 'trong hàng chờ', en: 'in queue' },
  'home.notifiedAt': { vi: 'Đã thông báo lúc', en: 'Notified at' },
  'home.myBookingCalendar': { vi: 'Lịch đặt của tôi', en: 'My booking calendar' },
  'home.exportExternalCalendar': {
    vi: 'Xuất lịch đặt ra lịch bên ngoài',
    en: 'Export bookings to external calendar',
  },
  'home.legend.myBooking': { vi: 'Đơn đặt lịch của tôi', en: 'My booking' },
  'home.legend.maintenance': { vi: 'Bảo trì', en: 'Maintenance' },
  'home.legend.workflowBooking': { vi: 'Đặt lịch theo quy trình', en: 'Workflow booking' },
  'home.legend.internalBooking': { vi: 'Đặt lịch nội bộ', en: 'Internal booking' },
  'home.legend.notAvailable': { vi: 'Không khả dụng', en: 'Not available' },
  'home.legend.groupBooking': { vi: 'Đặt lịch nhóm', en: 'Group booking' },
  'home.legend.externalBooking': { vi: 'Đặt lịch bên ngoài', en: 'External booking' },
  'home.legend.announcement': { vi: 'Thông báo', en: 'Announcement' },
  'header.support': { vi: 'Hỗ trợ', en: 'Support' },

  // Checkout modal
  'checkout.modalTitle': { vi: 'Xác nhận Check-out', en: 'Confirm Check-out' },
  'checkout.modalSubtitle': {
    vi: 'Lịch đặt của bạn đã kết thúc. Vui lòng xác nhận hoàn thành sử dụng.',
    en: 'Your booking has ended. Please confirm checkout.',
  },
  'checkout.endTime': { vi: 'Thời gian kết thúc', en: 'End Time' },
  'checkout.continue': { vi: 'Để sau', en: 'Snooze' },
  'checkout.confirm': { vi: 'Xác nhận Check-out', en: 'Confirm Check-out' },
  'checkout.checkoutSuccess': { vi: 'Check-out thành công', en: 'Checked out successfully' },

  // My Violations Page
  'violations.title': { vi: 'Vi phạm & điểm phạt', en: 'Violations & Penalties' },
  'violations.subtitle': {
    vi: 'Theo dõi các vi phạm liên quan tới booking, tổng điểm phạt và trạng thái hạn chế tài khoản.',
    en: 'Track booking violations, total penalty points, and account restriction status.',
  },
  'violations.accountHealth': { vi: 'Sức khỏe tài khoản', en: 'Account Health' },
  'violations.penaltyPoints': { vi: 'điểm phạt', en: 'penalty points' },
  'violations.activePoints': { vi: 'Điểm hiệu lực', en: 'Active Points' },
  'violations.restrictedUntil': { vi: 'Hạn chế đến', en: 'Restricted Until' },
  'violations.summary': { vi: 'Tổng hợp', en: 'Summary' },
  'violations.distribution': { vi: 'Phân bố vi phạm', en: 'Violation Distribution' },
  'violations.noViolations': { vi: 'Bạn chưa có vi phạm', en: 'No violations recorded' },
  'violations.noViolationsMsg': {
    vi: 'Duy trì check-in/check-out đúng giờ và sử dụng tài nguyên đúng hướng dẫn.',
    en: 'Keep checking in/out on time and follow resource guidelines.',
  },
  'violations.code': { vi: 'Mã', en: 'Code' },
  'violations.booking': { vi: 'Booking', en: 'Booking' },
  'violations.type': { vi: 'Loại vi phạm', en: 'Violation Type' },
  'violations.pointsAdded': { vi: 'Điểm cộng', en: 'Points Added' },
  'violations.loggedAt': { vi: 'Ngày ghi nhận', en: 'Logged Date' },

  // Bookings & Waitlists
  'bookings.mySubtitle': {
    vi: 'Theo dõi toàn bộ yêu cầu, trạng thái duyệt và các lượt sử dụng sắp diễn ra.',
    en: 'Track all booking requests, approval status, and upcoming usage.',
  },
  'bookings.purpose': { vi: 'Mục đích', en: 'Purpose' },
  'bookings.priority': { vi: 'Ưu tiên', en: 'Priority' },
  'bookings.createdAt': { vi: 'Ngày tạo', en: 'Created Date' },
  'bookings.code': { vi: 'Mã Booking', en: 'Booking Code' },
  'bookings.to': { vi: 'Đến', en: 'To' },
  'bookings.details': { vi: 'Chi tiết booking', en: 'Booking Details' },
  'bookings.user': { vi: 'Người đặt', en: 'Requester' },
  'bookings.resource': { vi: 'Tài nguyên', en: 'Resource' },
  'bookings.time': { vi: 'Thời gian', en: 'Time' },

  'waitlists.title': { vi: 'Hàng chờ của tôi', en: 'My Waitlist' },
  'waitlists.subtitle': {
    vi: 'Theo dõi vị trí, thời gian giữ chỗ và tạo booking ngay khi nhận được thông báo.',
    en: 'Track position, reserved spot duration, and book as soon as notified.',
  },
  'waitlists.waiting': { vi: 'Đang chờ', en: 'Waiting' },
  'waitlists.notified': { vi: 'Đã thông báo', en: 'Notified' },
  'waitlists.booked': { vi: 'Đã booking', en: 'Booked' },
  'waitlists.expiredOrCancelled': { vi: 'Hết hạn / hủy', en: 'Expired / Cancelled' },
  'waitlists.positionInQueue': { vi: 'Vị trí trong hàng', en: 'Queue Position' },
  'waitlists.remainingTime': {
    vi: 'Thời gian giữ chỗ còn lại',
    en: 'Reserved Spot Remaining Time',
  },
  'waitlists.backendNote': {
    vi: 'Hệ thống giữ lượt tối đa 30 phút từ',
    en: 'Spot held for max 30 mins from',
  },
  'waitlists.noWaitlists': { vi: 'Không có lượt hàng chờ', en: 'No waitlist entries' },
  'waitlists.noWaitlistsMsg': {
    vi: 'Khi khung giờ mong muốn bị chiếm, bạn có thể tham gia hàng chờ từ luồng tạo booking.',
    en: 'When a desired time slot is busy, join the waitlist from booking flow.',
  },

  // Calendar Page
  'calendar.title': { vi: 'Lịch tài nguyên dùng chung', en: 'Shared Resource Calendar' },
  'calendar.subtitle': {
    vi: 'Theo dõi booking và bảo trì trên toàn bộ phòng lab, thiết bị theo tháng hoặc dạng danh sách.',
    en: 'Track bookings and maintenance across all labs and equipment by month or list.',
  },
  'calendar.createBooking': { vi: '+ Tạo booking', en: '+ Create Booking' },
  'calendar.scheduleMaintenance': { vi: '+ Lên lịch bảo trì', en: '+ Schedule Maintenance' },
  'calendar.allLabs': { vi: 'Tất cả phòng', en: 'All Labs' },
  'calendar.allEquipments': { vi: 'Tất cả thiết bị', en: 'All Equipment' },
  'calendar.bookingAndMaintenance': { vi: 'Booking & bảo trì', en: 'Booking & Maintenance' },
  'calendar.today': { vi: 'Hôm nay', en: 'Today' },
  'calendar.eventsInPeriod': { vi: 'sự kiện trong kỳ', en: 'events in period' },
  'calendar.monthView': { vi: 'Tháng', en: 'Month' },
  'calendar.listView': { vi: 'Danh sách', en: 'List' },
  'calendar.labFilter': { vi: 'Phòng lab', en: 'Lab Room' },
  'calendar.equipmentFilter': { vi: 'Thiết bị', en: 'Equipment' },
  'calendar.eventTypeFilter': { vi: 'Loại sự kiện', en: 'Event Type' },

  // Notifications Page
  'notifications.badgeText': { vi: 'Cập nhật theo thời gian thực', en: 'Real-time Updates' },
  'notifications.title': { vi: 'Trung tâm thông báo', en: 'Notification Center' },
  'notifications.subtitle': {
    vi: 'Theo dõi booking, hàng chờ, vi phạm, bảo trì và thông báo hệ thống.',
    en: 'Track bookings, waitlists, violations, maintenance, and system alerts.',
  },
  'notifications.markAllAsRead': { vi: 'Đánh dấu tất cả đã đọc', en: 'Mark all as read' },
  'notifications.searchPlaceholder': {
    vi: 'Tìm trong thông báo...',
    en: 'Search in notifications...',
  },
  'notifications.allTypes': { vi: 'Tất cả loại', en: 'All types' },
  'notifications.overviewTitle': { vi: 'Tổng quan hộp thư', en: 'Inbox Overview' },
  'notifications.overviewSub': {
    vi: 'Thông báo chưa đọc sẽ có nền tím nhạt và chấm trạng thái ở bên phải.',
    en: 'Unread notifications have a light purple background and a status dot.',
  },
  'notifications.showing': { vi: 'Đang hiển thị', en: 'Showing' },
  'notifications.groups': { vi: 'Nhóm thông báo', en: 'Notification groups' },
  'notifications.quickClass': { vi: 'Phân loại nhanh', en: 'Quick Classification' },

  // Profile Page
  'profile.badgeText': { vi: 'Hồ sơ cá nhân', en: 'Personal Profile' },
  'profile.title': { vi: 'Tài khoản của bạn', en: 'Your Account' },
  'profile.subtitle': {
    vi: 'Thông tin được đồng bộ từ hệ thống và hiện chỉ hỗ trợ chế độ xem.',
    en: 'Information synchronized from the system (read-only view).',
  },
  'profile.fullName': { vi: 'Họ và Tên', en: 'Full Name' },
  'profile.createdAt': { vi: 'Ngày tạo tài khoản', en: 'Account Creation Date' },
  'profile.notUpdated': { vi: 'Chưa cập nhật', en: 'Not updated' },
  'profile.address': { vi: 'Địa chỉ', en: 'Address' },
  'profile.department': { vi: 'Khoa / Phòng ban', en: 'Department' },
  'profile.logout': { vi: 'Đăng xuất', en: 'Log out' },
  'profile.bookingHistory': { vi: 'Lịch sử booking', en: 'Booking History' },
  'profile.editProfile': { vi: 'Sửa hồ sơ', en: 'Edit Profile' },
  'profile.accountSecurity': { vi: 'Bảo mật tài khoản', en: 'Account Security' },
  'profile.securityNote': {
    vi: 'Backend hiện chưa có API đổi mật khẩu khi đang đăng nhập. Bạn có thể dùng luồng đặt lại qua email.',
    en: 'Backend password change API not available while logged in. Use email reset flow.',
  },
  'profile.resetPassword': { vi: 'Đặt lại mật khẩu', en: 'Reset Password' },
  'profile.accountInfo': { vi: 'Thông tin tài khoản', en: 'Account Information' },
  'profile.accountInfoSub': {
    vi: 'Dữ liệu được đồng bộ từ hồ sơ hệ thống',
    en: 'Data synchronized from system profile',
  },
  'profile.userId': { vi: 'MÃ NGƯỜI DÙNG', en: 'USER ID' },
  'profile.username': { vi: 'USERNAME', en: 'USERNAME' },
  'profile.email': { vi: 'EMAIL', en: 'EMAIL' },
  'profile.role': { vi: 'VAI TRÒ', en: 'ROLE' },
  'profile.activeStatusTitle': { vi: 'Trạng thái hoạt động', en: 'Active Status' },
  'profile.activeStatusSub': {
    vi: 'Quyền sử dụng hệ thống hiện tại',
    en: 'Current system access rights',
  },
  'profile.activeStatusDesc': {
    vi: 'Có thể sử dụng đầy đủ các chức năng theo vai trò được cấp.',
    en: 'Full access to all features according to assigned role.',
  },
  'profile.restrictionTitle': { vi: 'Thời hạn hạn chế', en: 'Restriction Period' },
  'profile.restrictionSub': {
    vi: 'Áp dụng khi tài khoản Restricted',
    en: 'Applies when account is Restricted',
  },
  'profile.noRestriction': { vi: 'Không có thời hạn hạn chế', en: 'No restriction period' },
  'profile.noRestrictionDesc': {
    vi: 'Tài khoản hiện không lưu RestrictionUntil.',
    en: 'Account currently has no RestrictionUntil set.',
  },
  'profile.needUpdateTitle': { vi: 'Cần cập nhật thông tin?', en: 'Need to update profile info?' },
  'profile.needUpdateSub': {
    vi: 'Hiện chưa có API tự sửa hồ sơ. Hãy liên hệ Admin để thay đổi họ tên, email, khoa/phòng ban hoặc vai trò.',
    en: 'Self-edit profile API is not available yet. Please contact Admin to change name, email, department, or role.',
  },

  // Maintenances Page
  'maintenances.title': { vi: 'Lịch bảo trì', en: 'Maintenance Schedule' },
  'maintenances.subtitle': {
    vi: 'Theo dõi và quản lý kế hoạch bảo trì phòng lab và thiết bị dùng chung.',
    en: 'Track and manage maintenance plans for shared lab rooms and equipment.',
  },
  'maintenances.createSchedule': { vi: 'Lên lịch bảo trì', en: 'Schedule Maintenance' },
  'maintenances.totalSchedules': { vi: 'Tổng số lịch', en: 'Total Schedules' },
  'maintenances.scheduled': { vi: 'Đã lên lịch', en: 'Scheduled' },
  'maintenances.inProgress': { vi: 'Đang bảo trì', en: 'In Progress' },
  'maintenances.completed': { vi: 'Hoàn thành', en: 'Completed' },
  'maintenances.labFilter': { vi: 'Phòng lab', en: 'Lab Room' },
  'maintenances.equipmentFilter': { vi: 'Thiết bị', en: 'Equipment' },
  'maintenances.allLabs': { vi: 'Tất cả phòng', en: 'All Labs' },
  'maintenances.allEquipment': { vi: 'Tất cả thiết bị', en: 'All Equipment' },
  'maintenances.recurring': { vi: 'Định kỳ', en: 'Recurrence' },

  // Nav Item Aliases
  'nav.maintenanceSchedule': { vi: 'Lịch bảo trì', en: 'Maintenance Schedule' },
  'nav.myBooking': { vi: 'Booking của tôi', en: 'My Bookings' },
  'nav.equipment': { vi: 'Thiết bị thí nghiệm', en: 'Lab Equipment' },
  'nav.labs': { vi: 'Phòng thí nghiệm', en: 'Lab Rooms' },
  'nav.manageBookings': { vi: 'Quản lý booking', en: 'Manage Bookings' },
  'nav.pendingBookings': { vi: 'Booking cần duyệt', en: 'Bookings to Approve' },
  'nav.users': { vi: 'Quản lý người dùng', en: 'User Management' },

  // Policy Page
  'policy.title': { vi: 'Chính sách phòng Lab', en: 'Lab Policy & Rules' },
  'policy.subtitle': {
    vi: 'Quy định chung và hình thức xử lý vi phạm áp dụng cho toàn bộ người dùng.',
    en: 'General rules and penalty guidelines applicable to all lab users.',
  },
  'policy.generalRules': { vi: 'Quy định chung', en: 'General Rules' },
  'policy.generalRulesSub': {
    vi: 'Áp dụng cho toàn bộ người dùng phòng Lab',
    en: 'Applies to all lab room users',
  },
  'policy.addRule': { vi: 'Thêm quy định', en: 'Add Rule' },
  'policy.addCategory': { vi: 'Thêm hạng mục', en: 'Add Category' },
  'policy.addItem': { vi: 'Thêm hành vi', en: 'Add Action' },

  // Pending Bookings Page
  'pendingBookings.title': { vi: 'Hàng đợi booking cần duyệt', en: 'Pending Bookings Queue' },
  'pendingBookings.subtitle': {
    vi: 'Danh sách được sắp xếp theo PriorityLevel tăng dần, sau đó theo thời điểm tạo sớm nhất.',
    en: 'List sorted by ascending PriorityLevel, then by earliest creation time.',
  },
  'pendingBookings.priorityPrincipleTitle': {
    vi: 'Nguyên tắc xử lý ưu tiên',
    en: 'Priority Handling Principle',
  },
  'pendingBookings.priorityPrincipleDesc': {
    vi: 'Số ưu tiên càng nhỏ càng được xét trước. Khi duyệt, backend kiểm tra lại xung đột trong transaction; lỗi 409 nghĩa là slot vừa bị booking khác khóa.',
    en: 'Lower priority number is considered first. Backend verifies conflicts during transaction approval; error 409 means slot was just locked by another booking.',
  },
  'pendingBookings.noPendingTitle': {
    vi: 'Không còn booking chờ duyệt',
    en: 'No Pending Bookings',
  },
  'pendingBookings.noPendingSub': {
    vi: 'Tất cả yêu cầu hiện đã được xử lý.',
    en: 'All requests have been processed.',
  },
  'pendingBookings.approve': { vi: 'Duyệt', en: 'Approve' },
  'pendingBookings.reject': { vi: 'Từ chối', en: 'Reject' },

  // Bookings Management Page
  'manageBookings.title': { vi: 'Quản lý booking', en: 'Manage Bookings' },
  'manageBookings.subtitle': {
    vi: 'Tra cứu, theo dõi và xử lý vòng đời booking trong phạm vi quyền quản lý.',
    en: 'Lookup, track, and manage booking lifecycle within management scope.',
  },
  'manageBookings.searchPlaceholder': {
    vi: 'Mã booking, user ID, mục đích...',
    en: 'Booking ID, user ID, purpose...',
  },

  // Incidents Page
  'incidents.title': { vi: 'Duyệt sự cố sử dụng', en: 'Review Incident Reports' },
  'incidents.subtitle': {
    vi: 'Xác nhận hoặc từ chối các sự cố được báo từ UsageLog. Xác nhận có thể phát sinh vi phạm và điểm phạt.',
    en: 'Confirm or reject incidents reported from UsageLog. Confirmation may generate violations and penalty points.',
  },
  'incidents.noIncidentsTitle': { vi: 'Không có sự cố', en: 'No Incidents' },
  'incidents.noIncidentsSub': {
    vi: 'Không có bản ghi sự cố phù hợp với khoảng thời gian và trạng thái đã chọn.',
    en: 'No incident records match the selected date range and status.',
  },

  // Waitlists Management Page
  'manageWaitlists.title': { vi: 'Quản lý hàng chờ', en: 'Manage Waitlists' },
  'manageWaitlists.subtitle': {
    vi: 'Theo dõi thứ tự, thông báo người tiếp theo, hết hạn hoặc hủy lượt trong phạm vi quản lý.',
    en: 'Track order, notify next requester, expire or cancel slots in scope.',
  },
  'manageWaitlists.emptyTitle': { vi: 'Hàng chờ đang trống', en: 'Waitlist is Empty' },
  'manageWaitlists.emptySub': {
    vi: 'Không có bản ghi phù hợp với trạng thái hoặc bộ lọc queue.',
    en: 'No records match the queue filter or status.',
  },
  'manageWaitlists.notifyNext': { vi: 'Thông báo người tiếp theo', en: 'Notify Next User' },
  'manageWaitlists.filterQueue': { vi: 'Lọc queue', en: 'Filter Queue' },

  // Users Page
  'users.title': { vi: 'Quản lý người dùng', en: 'User Management' },
  'users.subtitle': {
    vi: 'Tìm kiếm, phân quyền và theo dõi trạng thái toàn bộ tài khoản trong hệ thống.',
    en: 'Search, manage roles, and track status of all user accounts.',
  },
  'users.createUser': { vi: 'Tạo người dùng', en: 'Create User' },
  'users.totalAccounts': { vi: 'Tổng tài khoản', en: 'Total Accounts' },
  'users.displaying': { vi: 'Đang hiển thị', en: 'Displaying' },
  'users.totalPenalties': { vi: 'Tổng điểm phạt', en: 'Total Penalties' },
  'users.searchPlaceholder': {
    vi: 'Họ tên, username hoặc email...',
    en: 'Name, username, or email...',
  },
  'users.role': { vi: 'Vai trò', en: 'Role' },
  'users.penaltyPoints': { vi: 'Điểm phạt', en: 'Penalty Points' },
  'users.restrictionUntil': { vi: 'Hạn chế đến', en: 'Restriction Until' },

  // Departments Page
  'departments.title': { vi: 'Khoa và phòng ban', en: 'Departments & Units' },
  'departments.subtitle': {
    vi: 'Quản lý đơn vị công tác của người dùng mà không xóa dữ liệu lịch sử.',
    en: 'Manage organizational units without deleting historical data.',
  },
  'departments.addDepartment': { vi: 'Thêm đơn vị', en: 'Add Department' },
  'departments.totalUnits': { vi: 'Tổng đơn vị', en: 'Total Units' },
  'departments.active': { vi: 'Đang hoạt động', en: 'Active' },
  'departments.inactive': { vi: 'Ngừng hoạt động', en: 'Inactive' },
  'departments.searchPlaceholder': {
    vi: 'Tên hoặc mô tả đơn vị...',
    en: 'Unit name or description...',
  },

  // Manage Violations Page
  'manageViolations.title': { vi: 'Quản lý vi phạm', en: 'Violation Management' },
  'manageViolations.subtitle': {
    vi: 'Tạo, xử lý hoặc hủy vi phạm; theo dõi điểm phạt phát sinh từ booking và sự cố.',
    en: 'Create, resolve, or cancel violations; track penalty points from bookings and incidents.',
  },
  'manageViolations.createViolation': { vi: 'Tạo vi phạm', en: 'Create Violation' },
  'manageViolations.active': { vi: 'Đang hiệu lực', en: 'Active' },
  'manageViolations.resolved': { vi: 'Đã xử lý', en: 'Resolved' },
  'manageViolations.cancelled': { vi: 'Đã hủy', en: 'Cancelled' },
  'manageViolations.violationType': { vi: 'Loại vi phạm', en: 'Violation Type' },
  'manageViolations.searchPlaceholder': {
    vi: 'Violation ID, User ID, Booking ID...',
    en: 'Violation ID, User ID, Booking ID...',
  },
  'manageViolations.points': { vi: 'Điểm', en: 'Points' },
  'manageViolations.loggedAt': { vi: 'Ngày ghi nhận', en: 'Logged At' },
}

export function getDictionary(lang: 'vi' | 'en'): Record<string, any> {
  const dict: Record<string, any> = {}
  for (const [key, val] of Object.entries(translations)) {
    const text = val[lang] || val.vi || key
    dict[key] = text
    const parts = key.split('.')
    let current = dict
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {}
      }
      current = current[part]
    }
    current[parts[parts.length - 1]] = text
  }
  return dict
}
