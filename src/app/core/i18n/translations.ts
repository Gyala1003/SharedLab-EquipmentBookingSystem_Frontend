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
  'nav.items.allBookings': { vi: 'Danh sách Booking', en: 'All Bookings' },
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
  'common.pending': { vi: 'Chờ duyệt', en: 'Pending' },
  'common.approved': { vi: 'Đã duyệt', en: 'Approved' },
  'common.completed': { vi: 'Hoàn thành', en: 'Completed' },
  'common.rejected': { vi: 'Bị từ chối', en: 'Rejected' },
  'common.cancelled': { vi: 'Đã hủy', en: 'Cancelled' },
  'common.detail': { vi: 'Chi tiết', en: 'Details' },
  'common.allStatuses': { vi: 'Tất cả trạng thái', en: 'All Statuses' },
  'common.records': { vi: 'bản ghi', en: 'records' },
  'common.reload': { vi: 'Tải lại', en: 'Reload' },
  'common.code': { vi: 'Mã', en: 'Code' },
  'common.tableView': { vi: 'Bảng', en: 'Table' },
  'common.cardView': { vi: 'Thẻ', en: 'Cards' },
  'maintenances.recurring': { vi: 'Định kỳ', en: 'Recurrence' },

  // Incidents
  'incidents.title': { vi: 'Duyệt báo cáo sự cố', en: 'Review Incident Reports' },
  'incidents.subtitle': {
    vi: 'Xác nhận hoặc từ chối các sự cố được báo cáo từ Nhật ký sử dụng.',
    en: 'Confirm or reject incidents reported from Usage Logs.',
  },
  'incidents.pending': { vi: 'Chờ duyệt', en: 'Pending' },
  'incidents.confirmed': { vi: 'Đã xác nhận', en: 'Confirmed' },
  'incidents.rejected': { vi: 'Đã từ chối', en: 'Rejected' },
  'incidents.noIncidentsTitle': { vi: 'Không có báo cáo sự cố', en: 'No Incident Reports' },
  'incidents.noIncidentsSub': {
    vi: 'Không tìm thấy báo cáo sự cố nào phù hợp với điều kiện lọc.',
    en: 'No incident reports match the current filter criteria.',
  },
  'incidents.confirm': { vi: 'Xác nhận sự cố', en: 'Confirm Incident' },
  'incidents.reject': { vi: 'Từ chối sự cố', en: 'Reject Incident' },
  'incidents.affectedEquipment': { vi: 'Thiết bị ảnh hưởng', en: 'Affected Equipment' },
  'incidents.reviewNote': { vi: 'Ghi chú xét duyệt', en: 'Review Note' },
  'incidents.reviewPlaceholder': {
    vi: 'Kết quả kiểm tra, bằng chứng hoặc hướng xử lý...',
    en: 'Inspection results, evidence, or action plan...',
  },
  'incidents.confirmWarning': {
    vi: 'Cảnh báo: Việc xác nhận sự cố có thể tự động ghi nhận vi phạm và điểm phạt.',
    en: 'Warning: Confirmed incidents may generate automatic violations and penalty points.',
  },

  // Manage Bookings
  'manageBookings.title': { vi: 'Quản lý Booking', en: 'Manage Bookings' },
  'manageBookings.subtitle': {
    vi: 'Tra cứu, theo dõi và quản lý toàn bộ vòng đời yêu cầu booking trong phạm vi quản lý.',
    en: 'Lookup, track, and manage booking lifecycle within management scope.',
  },
  'manageBookings.rejectTitle': { vi: 'Từ chối booking', en: 'Reject Booking' },
  'manageBookings.rejectSubtitle': {
    vi: 'Nhập lý do từ chối để người dùng biết.',
    en: 'Provide rejection reason for requester.',
  },
  'manageBookings.rejectReasonLabel': { vi: 'Lý do từ chối *', en: 'Rejection Reason *' },
  'manageBookings.rejectReasonPlaceholder': {
    vi: 'Khung giờ này thiết bị đang bảo trì, vui lòng chọn khung giờ khác...',
    en: 'The equipment is under maintenance during this period, please select another time...',
  },
  'manageBookings.confirmRejectBtn': { vi: 'Xác nhận từ chối', en: 'Confirm Rejection' },
  'manageBookings.rejectingBtn': { vi: 'Đang từ chối...', en: 'Rejecting...' },
  'manageBookings.fullDetailBtn': { vi: 'Xem trang đầy đủ', en: 'View Full Page' },

  // Bookings list & table
  'bookings.bookingCode': { vi: 'Mã Booking', en: 'Booking Code' },
  'bookings.mySubtitle': {
    vi: 'Theo dõi toàn bộ yêu cầu, trạng thái duyệt và các lượt sử dụng sắp diễn ra.',
    en: 'Track all requests, approval statuses, and upcoming lab sessions.',
  },
  'bookings.resource': { vi: 'Phòng lab / Thiết bị', en: 'Lab Room / Equipment' },
  'bookings.usageTime': { vi: 'Thời gian sử dụng', en: 'Usage Time' },
  'bookings.checkinStatus': { vi: 'Trạng thái Check-in', en: 'Check-in Status' },
  'bookings.checkedInAt': { vi: 'Đã check-in lúc {time}', en: 'Checked in at {time}' },
  'bookings.checkoutNow': { vi: 'Check-out ngay', en: 'Check-out now' },
  'bookings.checkedOut': { vi: 'Đã trả phòng', en: 'Checked out' },
  'bookings.checkinNow': { vi: 'Check-in ngay', en: 'Check-in now' },
  'bookings.notStartedYet': { vi: 'Chưa đến giờ', en: 'Not started yet' },
  'bookings.overdue': { vi: 'Đã quá giờ', en: 'Overdue' },
  'bookings.awaitingApproval': { vi: 'Chờ LabManager duyệt', en: 'Awaiting LabManager approval' },
  'bookings.searchPlaceholder': {
    vi: 'Tìm mã BK, tài nguyên, mục đích...',
    en: 'Search booking code, resource, purpose...',
  },
  'bookings.detailTitle': { vi: 'Chi tiết Booking', en: 'Booking Details' },
  'bookings.detailSubtitle': {
    vi: 'Thông tin tài nguyên, lịch trình và trạng thái check-in',
    en: 'Resource details, schedule, and check-in status',
  },
  'bookings.priorityLevel': { vi: 'Mức ưu tiên', en: 'Priority Level' },
  'bookings.startTime': { vi: 'Thời gian bắt đầu', en: 'Start Time' },
  'bookings.endTime': { vi: 'Thời gian kết thúc', en: 'End Time' },
  'bookings.purposeDesc': { vi: 'Mục đích sử dụng', en: 'Usage Purpose' },
  'bookings.rejectionReason': { vi: 'Lý do từ chối', en: 'Rejection Reason' },
  'bookings.registeredResources': { vi: 'Tài nguyên đã đăng ký', en: 'Registered Resources' },
  'bookings.openFullDetail': { vi: 'Mở trang chi tiết đầy đủ', en: 'Open Full Detail Page' },
  'bookings.cancelThisBooking': { vi: 'Hủy Booking này', en: 'Cancel This Booking' },

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
  'home.mySchedule': { vi: 'Lịch đặt của tôi', en: 'My Booking Schedule' },
  'home.today': { vi: 'Hôm nay', en: 'Today' },
  'home.day': { vi: 'Ngày', en: 'Day' },
  'home.week': { vi: 'Tuần', en: 'Week' },
  'home.month': { vi: 'Tháng', en: 'Month' },
  'home.timeSlot': { vi: 'Khung giờ / Slot', en: 'Time / Slot' },
  'home.exportCalendar': {
    vi: 'Xuất lịch đặt ra lịch bên ngoài',
    en: 'Export schedule to external calendar',
  },
  'home.colorLegend': {
    vi: 'Chú giải màu sắc & loại booking:',
    en: 'Color & booking type legend:',
  },
  'home.legendMyBooking': { vi: 'Đơn đặt lịch của tôi', en: 'My Bookings' },
  'home.legendInternal': { vi: 'Đặt lịch nội bộ', en: 'Internal Booking' },
  'home.legendExternal': { vi: 'Đặt lịch bên ngoài', en: 'External Booking' },
  'home.legendMaintenance': { vi: 'Bảo trì', en: 'Maintenance' },
  'home.legendUnavailable': { vi: 'Không khả dụng', en: 'Unavailable' },
  'home.legendNotice': { vi: 'Thông báo', en: 'Notification' },
  'home.legendWorkflow': { vi: 'Đặt lịch theo quy trình', en: 'Workflow Booking' },
  'home.legendGroup': { vi: 'Đặt lịch nhóm', en: 'Group Booking' },
  'home.viewDetailedGuide': { vi: 'Xem hướng dẫn chi tiết', en: 'View detailed guide' },

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
  'bookings.purpose': { vi: 'MỤC ĐÍCH', en: 'PURPOSE' },
  'bookings.priority': { vi: 'ƯU TIÊN', en: 'PRIORITY' },
  'bookings.createdAt': { vi: 'Ngày tạo', en: 'Created Date' },
  'bookings.code': { vi: 'Mã Booking', en: 'Booking Code' },
  'bookings.to': { vi: 'Đến', en: 'To' },
  'bookings.details': { vi: 'Chi tiết booking', en: 'Booking Details' },
  'bookings.user': { vi: 'Người đặt', en: 'Requester' },
  'bookings.time': { vi: 'Thời gian', en: 'Time' },

  // Lab Names Translation Dictionary
  'Phòng Thực hành Mạng và Hạ tầng': {
    vi: 'Phòng Thực hành Mạng và Hạ tầng',
    en: 'Network & Infrastructure Lab',
  },
  'Phòng Thí nghiệm Điện tử và Viễn thông': {
    vi: 'Phòng Thí nghiệm Điện tử và Viễn thông',
    en: 'Electronics & Telecom Lab',
  },
  'Phòng Thí nghiệm Sinh học': { vi: 'Phòng Thí nghiệm Sinh học', en: 'Biology Laboratory' },
  'Phòng Thí nghiệm Hóa học': { vi: 'Phòng Thí nghiệm Hóa học', en: 'Chemistry Laboratory' },
  'Phòng Robot và Tự động hóa': {
    vi: 'Phòng Robot và Tự động hóa',
    en: 'Robotics & Automation Lab',
  },
  'Phòng AI và Khoa học dữ liệu': {
    vi: 'Phòng AI và Khoa học dữ liệu',
    en: 'AI & Data Science Lab',
  },
  'Phòng IoT và Hệ thống nhúng': {
    vi: 'Phòng IoT và Hệ thống nhúng',
    en: 'IoT & Embedded Systems Lab',
  },
  'Phòng Vật lý và Quang học': { vi: 'Phòng Vật lý và Quang học', en: 'Physics & Optics Lab' },
  'Phòng Cơ khí và In 3D': { vi: 'Phòng Cơ khí và In 3D', en: 'Mechanical & 3D Printing Lab' },
  'Phòng An toàn thông tin': { vi: 'Phòng An toàn thông tin', en: 'Information Security Lab' },

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
  'profile.verified': { vi: 'Đã xác thực', en: 'Verified' },
  'profile.legitScore': { vi: 'Điểm uy tín', en: 'Reputation Score' },
  'profile.penaltyPoints': { vi: 'Điểm phạt', en: 'Penalty Points' },
  'profile.normal': { vi: 'Bình thường', en: 'Normal' },
  'profile.restricted': { vi: 'Bị hạn chế', en: 'Restricted' },
  'profile.restrictedUntil': { vi: 'Hạn chế đến', en: 'Restricted Until' },
  'profile.restrictionDetail': {
    vi: 'Tài khoản bị hạn chế một số quyền lợi đặt lịch do đạt ngưỡng điểm phạt.',
    en: 'Account booking privileges restricted due to penalty threshold.',
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

  // Nav Item Aliases
  'nav.maintenanceSchedule': { vi: 'Lịch bảo trì', en: 'Maintenance Schedule' },
  'nav.systemMaintenance': { vi: 'Bảo trì hệ thống', en: 'System Maintenance' },
  'nav.items.systemMaintenance': { vi: 'Bảo trì hệ thống', en: 'System Maintenance' },
  'nav.myBooking': { vi: 'Booking của tôi', en: 'My Bookings' },
  'nav.equipment': { vi: 'Thiết bị thí nghiệm', en: 'Lab Equipment' },
  'nav.labs': { vi: 'Phòng thí nghiệm', en: 'Lab Rooms' },
  'nav.manageBookings': { vi: 'Quản lý booking', en: 'Manage Bookings' },
  'nav.pendingBookings': { vi: 'Booking cần duyệt', en: 'Bookings to Approve' },
  'nav.users': { vi: 'Quản lý người dùng', en: 'User Management' },

  // System Maintenance
  'systemMaintenance.title': { vi: 'Bảo trì hệ thống', en: 'System Maintenance' },
  'bookingForm.step2.slotUnderMaintenance': {
    vi: 'Đã có lịch bảo trì (Không thể đặt)',
    en: 'Under Maintenance (Locked)',
  },
  'systemMaintenance.subtitle': {
    vi: 'Bật/Tắt chế độ bảo trì toàn hệ thống và đặt thời gian dự kiến hoàn thành.',
    en: 'Toggle system-wide maintenance mode and set estimated completion schedule.',
  },
  'systemMaintenance.statusActive': { vi: 'Đang bảo trì hệ thống', en: 'System Under Maintenance' },
  'systemMaintenance.statusInactive': { vi: 'Hoạt động bình thường', en: 'System Operational' },
  'systemMaintenance.normalOperation': {
    vi: 'Toàn bộ dịch vụ sẵn sàng',
    en: 'All Services Operational',
  },
  'systemMaintenance.activeImpactNotice': {
    vi: 'Người dùng Requester và Manager đang được tự động chuyển hướng đến trang thông báo bảo trì.',
    en: 'Requester and Manager users are automatically redirected to the maintenance notice page.',
  },
  'systemMaintenance.inactiveNotice': {
    vi: 'Người dùng có thể truy cập hệ thống mượn phòng & thiết bị bình thường.',
    en: 'Users can access the lab and equipment booking system normally.',
  },
  'systemMaintenance.turnOn': { vi: 'Kích hoạt bảo trì ngay', en: 'Activate Maintenance Mode' },
  'systemMaintenance.turnOff': { vi: 'Tắt chế độ bảo trì', en: 'Deactivate Maintenance Mode' },
  'systemMaintenance.formHeader': {
    vi: 'Cấu hình & Đặt lịch bảo trì hệ thống',
    en: 'Configure System Maintenance Schedule',
  },
  'systemMaintenance.formSub': {
    vi: 'Đặt tiêu đề, thời gian bắt đầu, thời gian dự kiến hoàn thành và mô tả chi tiết.',
    en: 'Set title, start time, estimated completion time, and detailed scope.',
  },
  'systemMaintenance.fieldTitle': {
    vi: 'Tiêu đề thông báo (Tiếng Việt)',
    en: 'Notice Title (Vietnamese)',
  },
  'systemMaintenance.fieldTitleEn': {
    vi: 'Tiêu đề thông báo (Tiếng Anh)',
    en: 'Notice Title (English)',
  },
  'systemMaintenance.startTime': { vi: 'Thời gian bắt đầu bảo trì', en: 'Maintenance Start Time' },
  'systemMaintenance.endTime': {
    vi: 'Thời gian dự kiến hoàn thành',
    en: 'Estimated Completion Time',
  },
  'systemMaintenance.description': {
    vi: 'Mô tả & Phạm vi ảnh hưởng (Tiếng Việt)',
    en: 'Scope & Description (Vietnamese)',
  },
  'systemMaintenance.descriptionEn': {
    vi: 'Mô tả & Phạm vi ảnh hưởng (Tiếng Anh)',
    en: 'Scope & Description (English)',
  },
  'systemMaintenance.activateImmediately': {
    vi: 'Kích hoạt chế độ bảo trì ngay khi lưu',
    en: 'Enable maintenance mode immediately upon saving',
  },
  'systemMaintenance.saveBtn': { vi: 'Lưu lịch bảo trì', en: 'Save Maintenance Schedule' },
  'systemMaintenance.presetsTitle': {
    vi: 'Lịch bảo trì nhanh (Presets)',
    en: 'Quick Maintenance Presets',
  },
  'systemMaintenance.presetsSub': {
    vi: 'Áp dụng nhanh các khoảng thời gian bảo trì phổ biến.',
    en: 'Quickly apply common maintenance time windows.',
  },
  'systemMaintenance.hourEmergency': { vi: 'giờ (Khẩn cấp)', en: 'hour (Emergency)' },
  'systemMaintenance.hoursScheduled': { vi: 'giờ (Định kỳ)', en: 'hours (Scheduled)' },
  'systemMaintenance.overnightPreset': {
    vi: 'Bảo trì đêm (22h - 06h)',
    en: 'Overnight (22:00 - 06:00)',
  },
  'systemMaintenance.adminRulesTitle': {
    vi: 'Quy tắc hoạt động Admin',
    en: 'Admin Operation Rules',
  },
  'systemMaintenance.adminRule1': {
    vi: 'Tài khoản Admin có quyền bỏ qua bảo trì để thực hiện công việc quản trị.',
    en: 'Admin accounts bypass maintenance restriction to perform administrative tasks.',
  },
  'systemMaintenance.adminRule2': {
    vi: 'Khi kích hoạt, mọi phiên làm việc của Requester và Manager sẽ tự động trỏ về trang thông báo bảo trì.',
    en: 'When active, all Requester and Manager sessions are automatically routed to the maintenance page.',
  },
  'systemMaintenance.adminRule3': {
    vi: 'Hệ thống tự động hiển thị đếm ngược thời gian hoàn thành theo cấu hình.',
    en: 'System automatically displays countdown timer based on estimated end time.',
  },

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
  'manageBookings.searchPlaceholder': {
    vi: 'Mã booking, user ID, mục đích...',
    en: 'Booking ID, user ID, purpose...',
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

  //auth
  'auth.validation.identifierRequired': {
    vi: 'Vui lòng nhập email hoặc username',
    en: 'Please enter your email or username',
  },
  'auth.validation.identifierInvalid': {
    vi: 'Email hoặc username không được vượt quá 100 ký tự',
    en: 'Email or username cannot exceed 100 characters',
  },
  'auth.validation.passwordRequired': {
    vi: 'Vui lòng nhập mật khẩu',
    en: 'Please enter your password',
  },
  'auth.validation.passwordMinLength': {
    vi: 'Mật khẩu phải nhiều hơn 5 ký tự',
    en: 'Password must be more than 5 characters',
  },
  'auth.error.invalidCredentials': {
    vi: 'Email/Username hoặc mật khẩu không chính xác.',
    en: 'Invalid email/username or password.',
  },
  'auth.error.serverError': {
    vi: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
    en: 'System error. Please try again later.',
  },
  'auth.error.tooManyRequests': {
    vi: 'Bạn thao tác quá nhanh, vui lòng thử lại sau',
    en: 'Too many requests. Please try again later',
  },
  'auth.error.invalidToken': {
    vi: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
    en: 'Password reset link is invalid or has expired.',
  },
  'auth.error.passwordMismatch': {
    vi: 'Mật khẩu xác nhận không trùng khớp',
    en: 'Confirm password does not match',
  },
  'auth.error.required': { vi: 'Trường này không được để trống', en: 'This field is required' },
  'auth.loginTitle': { vi: 'Đăng nhập', en: 'Sign In' },
  'auth.loginSubtitle': {
    vi: 'Vui lòng đăng nhập để sử dụng hệ thống',
    en: 'Please log in to use the system',
  },
  'auth.email': { vi: 'Email hoặc Username', en: 'Email or Username' },
  'auth.password': { vi: 'Mật khẩu', en: 'Password' },
  'auth.newPassword': { vi: 'Mật khẩu mới', en: 'New Password' },
  'auth.confirmPassword': { vi: 'Nhập lại mật khẩu mới', en: 'Confirm New Password' },
  'auth.loginBtn': { vi: 'Đăng nhập', en: 'Login' },
  'auth.forgotPassword': { vi: 'Bạn quên mật khẩu?', en: 'Forgot password?' },
  'auth.rememberMe': { vi: 'Ghi nhớ đăng nhập', en: 'Remember me' },
  'auth.cancel': { vi: 'Hủy bỏ', en: 'Cancel' },
  'auth.forgotPasswordTitle': { vi: 'Quên mật khẩu', en: 'Forgot Password' },
  'auth.resetPasswordTitle': { vi: 'Đặt lại mật khẩu', en: 'Reset Password' },
  'auth.sendResetLinkBtn': { vi: 'Gửi liên kết đặt lại mật khẩu', en: 'Send Password Reset Link' },
  'auth.changePasswordBtn': { vi: 'Đổi mật khẩu', en: 'Change Password' },
  'auth.backToLogin': { vi: 'Trở lại đăng nhập', en: 'Back to Login' },
  'auth.invalidLink': {
    vi: 'Liên kết không hợp lệ hoặc thiếu thông tin xác thực',
    en: 'Invalid or missing verification link parameters',
  },
  'auth.passwordPolicyHint': {
    vi: 'Mật khẩu phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt',
    en: 'Password must be at least 8 characters, with uppercase, lowercase, number, and special character',
  },
  'auth.passwordRules.minLength': { vi: 'Tối thiểu 8 ký tự', en: 'At least 8 characters' },
  'auth.passwordRules.uppercase': { vi: 'Có ít nhất 1 chữ hoa', en: 'At least 1 uppercase letter' },
  'auth.passwordRules.lowercase': {
    vi: 'Có ít nhất 1 chữ thường',
    en: 'At least 1 lowercase letter',
  },
  'auth.passwordRules.digit': { vi: 'Có ít nhất 1 chữ số', en: 'At least 1 number' },
  'auth.passwordRules.special': {
    vi: 'Có ít nhất 1 ký tự đặc biệt (@$!%*?&...)',
    en: 'At least 1 special character (@$!%*?&...)',
  },
  'auth.success.login': {
    vi: 'Đăng nhập thành công! Đang chuyển hướng...',
    en: 'Login successful! Redirecting...',
  },
  'auth.success.resetEmailSent': {
    vi: 'Đã gửi liên kết đặt lại mật khẩu! Vui lòng kiểm tra hộp thư email của bạn.',
    en: 'Password reset link sent! Please check your email inbox.',
  },
  'auth.success.resetPassword': {
    vi: 'Đổi mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...',
    en: 'Password changed successfully! Redirecting to login page...',
  },
  'header.login': { vi: 'Đăng nhập', en: 'Log in' },
  'header.nav.home': { vi: 'Trang chủ', en: 'Home' },
  'header.nav.about': { vi: 'Giới thiệu', en: 'About' },
  'header.nav.feature': { vi: 'Tính năng', en: 'Features' },
  'header.nav.workflow': { vi: 'Quy trình', en: 'How it works' },
  'header.nav.statistics': { vi: 'Thống kê', en: 'Statistics' },
  'header.nav.contact': { vi: 'Liên hệ', en: 'Contact' },
  'common.error': { vi: 'Đã có lỗi xảy ra', en: 'Something went wrong' },

  // Booking Form (Quick Booking)
  'bookingForm.title': { vi: 'Tạo yêu cầu booking', en: 'Create Booking Request' },
  'bookingForm.subtitle': {
    vi: 'Quy trình 4 bước giúp chọn đúng tài nguyên, thời gian và mức ưu tiên trước khi gửi duyệt.',
    en: '4-step process to select resources, schedule, and priority level before submission.',
  },
  'bookingForm.checkCalendar': { vi: 'Kiểm tra lịch', en: 'Check Schedule' },
  'bookingForm.accountStatusRestrictedTitle': {
    vi: 'Tài khoản hiện không thể tạo booking',
    en: 'Account currently restricted from creating bookings',
  },
  'bookingForm.accountStatusRestrictedMsg': {
    vi: 'Trạng thái hiện tại: {{status}}. Liên hệ quản trị viên hoặc chờ hết thời gian hạn chế.',
    en: 'Current status: {{status}}. Please contact admin or wait until restriction expires.',
  },

  'bookingForm.steps.resource': { vi: 'Tài nguyên', en: 'Resources' },
  'bookingForm.steps.time': { vi: 'Thời gian', en: 'Schedule' },
  'bookingForm.steps.purpose': { vi: 'Mục đích', en: 'Purpose' },
  'bookingForm.steps.confirm': { vi: 'Xác nhận', en: 'Confirm' },

  'bookingForm.step1.title': { vi: 'Chọn tài nguyên', en: 'Select Resources' },
  'bookingForm.step1.subtitle': {
    vi: 'Một booking chỉ được chứa tài nguyên thuộc cùng một phòng lab.',
    en: 'A booking can only contain resources belonging to the same lab.',
  },
  'bookingForm.step1.selectLabTitle': { vi: 'CHỌN PHÒNG THỰC HÀNH', en: 'SELECT LAB ROOM' },
  'bookingForm.step1.statusAvailable': { vi: 'Trống / Khả dụng', en: 'Available' },
  'bookingForm.step1.statusInUse': { vi: 'Đang sử dụng', en: 'In Use' },
  'bookingForm.step1.statusMaintenance': { vi: 'Đang bảo trì', en: 'Under Maintenance' },
  'bookingForm.step1.statusUnavailable': { vi: 'Không khả dụng', en: 'Unavailable' },
  'bookingForm.step1.badgeAvailable': { vi: 'Khả dụng', en: 'Available' },
  'bookingForm.step1.badgeInUse': { vi: 'Đang sử dụng', en: 'In Use' },
  'bookingForm.step1.badgeMaintenance': { vi: 'Bảo trì', en: 'Under Maintenance' },
  'bookingForm.step1.capacity': {
    vi: 'Sức chứa: {{count}} người',
    en: 'Capacity: {{count}} people',
  },
  'bookingForm.step1.addEquipmentTitle': {
    vi: 'Đặt thêm thiết bị trong phòng này',
    en: 'Book additional equipment in this room',
  },
  'bookingForm.step1.addEquipmentSubtitle': {
    vi: 'Tuỳ chọn — chọn thiết bị đang trống muốn book kèm',
    en: 'Optional — select available equipment to include',
  },
  'bookingForm.step1.equipmentsInLab': {
    vi: 'Thiết bị trong {{name}}',
    en: 'Equipment in {{name}}',
  },
  'bookingForm.step1.selectedCountText': { vi: '{{count}} đã chọn', en: '{{count}} selected' },
  'bookingForm.step1.bookEntireLab': { vi: 'Đặt cả phòng', en: 'Book Entire Lab' },
  'bookingForm.step1.bookEntireLabSub': {
    vi: 'Sử dụng toàn bộ không gian',
    en: 'Utilize the whole room space',
  },
  'bookingForm.step1.bookEquipment': { vi: 'Đặt thiết bị', en: 'Book Equipment' },
  'bookingForm.step1.bookEquipmentSub': {
    vi: 'Có thể chọn nhiều thiết bị',
    en: 'Select one or multiple items',
  },
  'bookingForm.step1.labLabel': { vi: 'Phòng lab *', en: 'Lab Room *' },
  'bookingForm.step1.labPlaceholder': { vi: 'Chọn phòng lab', en: 'Select a lab room' },
  'bookingForm.step1.roomNoteLabel': { vi: 'Ghi chú cho phòng', en: 'Notes for room' },
  'bookingForm.step1.roomNotePlaceholder': {
    vi: 'Yêu cầu bố trí, lưu ý khi sử dụng...',
    en: 'Seating arrangements, special usage notes...',
  },
  'bookingForm.step1.equipmentsTitle': { vi: 'Thiết bị trong phòng', en: 'Available Equipment' },
  'bookingForm.step1.equipmentsSubtitle': {
    vi: 'Chọn một hoặc nhiều thiết bị sẵn sàng',
    en: 'Select one or more available equipment items',
  },
  'bookingForm.step1.selectedCount': { vi: 'đã chọn', en: 'selected' },
  'bookingForm.step1.noEquipment': { vi: 'Không có thiết bị', en: 'No Equipment' },
  'bookingForm.step1.noEquipmentMsg': {
    vi: 'Phòng này chưa có thiết bị hoặc không thể tải dữ liệu.',
    en: 'This room has no available equipment or failed to load data.',
  },

  // Common
  'common.back': { vi: 'Quay lại', en: 'Back' },

  'bookingForm.step2.title': { vi: 'Chọn thời gian', en: 'Select Time Slot' },
  'bookingForm.step2.subtitle': {
    vi: 'Thời gian được chia làm 4 slot cố định trong ngày. Tối đa 2 lần đặt / ngày.',
    en: '4 fixed time slots per day. Maximum 2 bookings per person per day.',
  },
  'bookingForm.step2.dateLabel': { vi: 'Chọn ngày đặt lịch *', en: 'Booking Date *' },
  'bookingForm.step2.startLabel': { vi: 'Bắt đầu *', en: 'Start Time *' },
  'bookingForm.step2.endLabel': { vi: 'Kết thúc *', en: 'End Time *' },
  'bookingForm.step2.checkBtn': { vi: 'Kiểm tra khung giờ', en: 'Check Time Slot' },
  'bookingForm.step2.checkingBtn': { vi: 'Đang kiểm tra...', en: 'Checking...' },
  'bookingForm.step2.openCalendarBtn': { vi: 'Mở lịch phòng', en: 'Open Room Schedule' },
  'bookingForm.step2.joinWaitlistBtn': { vi: 'Tham gia hàng chờ', en: 'Join Waitlist' },
  'bookingForm.step2.joiningWaitlistBtn': { vi: 'Đang tham gia...', en: 'Joining...' },
  'bookingForm.step2.waitlistRestriction': {
    vi: 'Hàng chờ hiện chỉ nhận một phòng hoặc một thiết bị mỗi lượt. Hãy giữ lại một thiết bị nếu muốn tham gia.',
    en: 'Waitlist accepts only one room or one equipment per request. Keep a single item selected to join.',
  },
  'bookingForm.step2.suggestionsTitle': { vi: 'Khung giờ thay thế', en: 'Alternative Time Slots' },
  'bookingForm.step2.to': { vi: 'đến', en: 'to' },
  'bookingForm.step2.userQuota': {
    vi: 'Lượt đặt hôm nay: {current}/{max}',
    en: 'Your bookings today: {current}/{max}',
  },
  'bookingForm.step2.userLimitReached': {
    vi: 'Bạn đã đạt giới hạn tối đa 2 lượt đặt phòng/thiết bị trong ngày này.',
    en: 'You have reached the maximum limit of 2 bookings for this date.',
  },
  'bookingForm.step2.dayEventsTitle': {
    vi: 'Lịch đã đặt trong ngày',
    en: 'Schedule for Selected Date',
  },
  'bookingForm.step2.eventsCount': { vi: 'sự kiện', en: 'events' },
  'bookingForm.step2.loadingSchedule': {
    vi: 'Đang tải lịch trong ngày...',
    en: 'Loading schedule...',
  },
  'bookingForm.step2.noEventsToday': {
    vi: 'Ngày này chưa có lịch đặt nào',
    en: 'No bookings on this date yet',
  },
  'bookingForm.step2.allSlotsFree': {
    vi: 'Tất cả 4 slot đều đang trống và sẵn sàng.',
    en: 'All 4 time slots are available.',
  },
  'bookingForm.step2.bookedBy': { vi: 'Người đặt', en: 'Booked by' },
  'bookingForm.step2.selectSlotTitle': {
    vi: 'Chọn Slot thời gian (Tối đa 2 slot/ngày)',
    en: 'Select Time Slot (Max 2 slots/day)',
  },
  'bookingForm.step2.fixedSlotsHint': { vi: '4 slot cố định', en: '4 fixed slots' },
  'bookingForm.step2.slotOccupied': { vi: 'Đã có người đặt', en: 'Already Booked' },
  'bookingForm.step2.slotUserConflict': {
    vi: 'Đã có người đặt (Lịch cá nhân bị trùng #BK-{id})',
    en: 'Already Booked (Personal schedule conflict #BK-{id})',
  },
  'bookingForm.step2.slotLimitReached': {
    vi: 'Đã có người đặt (Đã đạt giới hạn 2 lượt đặt/ngày)',
    en: 'Already Booked (Daily limit reached)',
  },
  'bookingForm.step2.slotPastTime': {
    vi: 'Đã có người đặt (Khung giờ đã qua)',
    en: 'Already Booked (Time slot has passed)',
  },
  'bookingForm.step2.personalSchedule': { vi: 'Lịch đặt cá nhân', en: 'Personal Schedule' },
  'bookingForm.step2.cannotSelectSlot': {
    vi: 'Không thể chọn khung giờ này',
    en: 'Cannot select this time slot',
  },
  'bookingForm.step2.underMaintenanceMsg': {
    vi: 'đang trong thời gian bảo trì.',
    en: 'is currently under maintenance.',
  },
  'bookingForm.step2.conflictTitle': {
    vi: 'Lịch cá nhân bị trùng',
    en: 'Personal Schedule Conflict',
  },
  'bookingForm.step2.conflictMsg': {
    vi: 'Bạn đã có 1 lịch đặt khác',
    en: 'You already have another booking',
  },
  'bookingForm.step2.pastTimeTitle': { vi: 'Khung giờ đã trôi qua', en: 'Time Slot Has Passed' },
  'bookingForm.step2.pastTimeMsg': {
    vi: 'đã trôi qua so với thời gian hiện tại.',
    en: 'has already elapsed.',
  },
  'bookingForm.step2.limitReachedTitle': {
    vi: 'Đã đạt giới hạn đặt phòng',
    en: 'Daily Limit Reached',
  },
  'bookingForm.step2.limitReachedMsg': {
    vi: 'Bạn đã đạt giới hạn tối đa 2 lượt đặt phòng/ngày (2/2) trên toàn hệ thống phòng lab.',
    en: 'You have reached the maximum limit of 2 bookings per day across all lab rooms.',
  },
  'bookingForm.step2.slotOccupiedTitle': {
    vi: 'Khung giờ đã có người đặt',
    en: 'Time Slot Already Booked',
  },
  'bookingForm.step2.slotOccupiedMsg': {
    vi: 'đã được sử dụng bởi người dùng khác.',
    en: 'is already taken by another user.',
  },
  'bookingForm.step2.maxQuotaReached': {
    vi: 'Đã đạt giới hạn lượt đặt',
    en: 'Daily quota limit reached',
  },
  'bookingForm.step2.slotSelected': { vi: 'Đã chọn slot này', en: 'Slot selected' },
  'bookingForm.step2.slotAvailable': { vi: 'Sẵn sàng đặt', en: 'Available to book' },
  'bookingForm.step2.selectedTimeRange': { vi: 'Khung giờ đã chọn', en: 'Selected time range' },

  'bookingForm.step3.title': { vi: 'Mục đích & ưu tiên', en: 'Purpose & Priority' },
  'bookingForm.step3.subtitle': {
    vi: 'Mức ưu tiên được đọc từ quy tắc đang Active trong backend.',
    en: 'Priority level is determined by active system rules.',
  },
  'bookingForm.step3.descLabel': { vi: 'Mô tả mục đích *', en: 'Purpose Description *' },
  'bookingForm.step3.descPlaceholder': {
    vi: 'Mô tả nội dung thực hành, dự án, số người tham gia và kết quả mong đợi...',
    en: 'Describe lab work content, project scope, participant count, and expected outcomes...',
  },
  'bookingForm.step3.reviewBtn': { vi: 'Xem lại', en: 'Review Request' },

  'bookingForm.purposes.research.label': { vi: 'Dự án nghiên cứu', en: 'Research Project' },
  'bookingForm.purposes.research.desc': {
    vi: 'Nghiên cứu khoa học, đề tài hoặc dự án.',
    en: 'Scientific research, thesis, or project work.',
  },
  'bookingForm.purposes.course.label': { vi: 'Thực hành môn học', en: 'Course Practice' },
  'bookingForm.purposes.course.desc': {
    vi: 'Buổi thực hành theo kế hoạch môn học.',
    en: 'Practical lab session according to course syllabus.',
  },
  'bookingForm.purposes.selfStudy.label': { vi: 'Tự học', en: 'Self Study' },
  'bookingForm.purposes.selfStudy.desc': {
    vi: 'Tự nghiên cứu hoặc luyện tập cá nhân.',
    en: 'Independent research or personal practice.',
  },
  'bookingForm.purposes.other.label': { vi: 'Mục đích khác', en: 'Other Purpose' },
  'bookingForm.purposes.other.desc': {
    vi: 'Các nhu cầu hợp lệ ngoài ba nhóm trên.',
    en: 'Other valid activities outside the above categories.',
  },

  'bookingForm.step4.title': { vi: 'Xác nhận yêu cầu', en: 'Confirm Request' },
  'bookingForm.step4.subtitle': {
    vi: 'Kiểm tra lần cuối trước khi gửi booking ở trạng thái Pending.',
    en: 'Review your details before submitting as Pending booking.',
  },
  'bookingForm.step4.timeLabel': { vi: 'Thời gian', en: 'Schedule' },
  'bookingForm.step4.purposeLabel': { vi: 'Mục đích', en: 'Purpose' },
  'bookingForm.step4.priorityLevel': {
    vi: 'Mức ưu tiên P{{level}}',
    en: 'Priority Level P{{level}}',
  },
  'bookingForm.step4.selectedResources': { vi: 'Tài nguyên đã chọn', en: 'Selected Resources' },
  'bookingForm.step4.noNote': { vi: 'Không có ghi chú', en: 'No notes provided' },
  'bookingForm.step4.description': { vi: 'Mô tả', en: 'Description' },
  'bookingForm.step4.submitBtn': { vi: 'Gửi yêu cầu booking', en: 'Submit Booking Request' },
  'bookingForm.step4.submittingBtn': { vi: 'Đang gửi...', en: 'Submitting...' },

  'bookingForm.sidebar.quickSummary': { vi: 'Tóm tắt nhanh', en: 'Quick Summary' },
  'bookingForm.sidebar.labRoom': { vi: 'Phòng lab', en: 'Lab Room' },
  'bookingForm.sidebar.notSelected': { vi: 'Chưa chọn', en: 'Not selected' },
  'bookingForm.sidebar.resources': { vi: 'Tài nguyên', en: 'Resources' },
  'bookingForm.sidebar.priority': { vi: 'Ưu tiên', en: 'Priority' },
  'bookingForm.sidebar.tipTitle': { vi: 'Mẹo đặt lịch', en: 'Booking Tip' },
  'bookingForm.sidebar.tipBody': {
    vi: 'Kiểm tra lịch trước khi gửi. Pending không khóa tài nguyên; booking chỉ khóa slot sau khi được duyệt.',
    en: 'Check schedule before submitting. Pending status does not lock resources; slot is reserved once approved.',
  },

  // Header & User Menu
  'header.support': { vi: 'Hỗ trợ', en: 'Support' },
  'header.profile': { vi: 'Hồ sơ cá nhân', en: 'My Profile' },

  // Lab Detail Page
  'lab.notFoundTitle': { vi: 'Không tìm thấy phòng lab', en: 'Lab room not found' },
  'lab.notFoundMsg': {
    vi: 'Phòng lab có thể đã bị xóa hoặc bạn không có quyền truy cập.',
    en: 'The lab room may have been deleted or you do not have access.',
  },
  'lab.backToList': { vi: 'Về danh sách', en: 'Back to list' },
  'lab.bookFullRoom': { vi: 'Đặt cả phòng', en: 'Book full room' },
  'lab.scheduleMaintenance': { vi: 'Lên lịch bảo trì', en: 'Schedule maintenance' },
  'lab.edit': { vi: 'Chỉnh sửa', en: 'Edit' },
  'lab.location': { vi: 'Vị trí', en: 'Location' },
  'lab.capacity': { vi: 'Sức chứa', en: 'Capacity' },
  'lab.manager': { vi: 'Quản lý', en: 'Manager' },
  'lab.unassigned': { vi: 'Chưa phân công', en: 'Unassigned' },
  'lab.overview': { vi: 'Tổng quan', en: 'Overview' },
  'lab.researchSpace': { vi: 'Không gian nghiên cứu', en: 'Research Space' },
  'lab.noDescription': {
    vi: 'Chưa có mô tả cho phòng lab này.',
    en: 'No description available for this lab.',
  },
  'lab.usageGuideline': { vi: 'Hướng dẫn sử dụng', en: 'Usage Guidelines' },
  'lab.defaultGuideline': {
    vi: 'Liên hệ LabManager để được hướng dẫn trước khi sử dụng.',
    en: 'Contact LabManager for guidelines before use.',
  },
  'lab.viewSchedule': { vi: 'Xem lịch phòng', en: 'View lab schedule' },
  'lab.tabs.equipment': { vi: 'Thiết bị', en: 'Equipment' },
  'lab.tabs.schedule': { vi: 'Lịch tài nguyên', en: 'Resource Calendar' },
  'lab.tabs.maintenance': { vi: 'Bảo trì', en: 'Maintenance' },
  'lab.emptyEquipmentTitle': { vi: 'Phòng chưa có thiết bị', en: 'No equipment in this lab' },
  'lab.emptyEquipmentMsg': {
    vi: 'Admin có thể bổ sung thiết bị từ màn hình quản lý thiết bị.',
    en: 'Admin can add equipment from the equipment management screen.',
  },
  'lab.emptyScheduleTitle': {
    vi: 'Không có lịch trong 30 ngày tới',
    en: 'No schedule for the next 30 days',
  },
  'lab.emptyScheduleMsg': {
    vi: 'Phòng hiện chưa có booking hoặc bảo trì trong khoảng thời gian này.',
    en: 'The lab currently has no bookings or maintenance in this period.',
  },
  'lab.emptyMaintenanceTitle': { vi: 'Chưa có lịch bảo trì', en: 'No maintenance history' },
  'lab.emptyMaintenanceMsg': {
    vi: 'Không có lịch bảo trì trực tiếp hoặc thiết bị thuộc phòng trong dữ liệu hiện tại.',
    en: 'No maintenance records found for this lab or its equipment.',
  },
  'lab.maintenanceItem': { vi: 'Bảo trì #{id}', en: 'Maintenance #{id}' },

  // Equipment Detail Page
  'equipment.notFoundTitle': { vi: 'Không tìm thấy thiết bị', en: 'Equipment not found' },
  'equipment.notFoundMsg': {
    vi: 'Thiết bị có thể đã ngừng sử dụng hoặc không tồn tại.',
    en: 'Equipment may be inactive or does not exist.',
  },
  'equipment.book': { vi: 'Đặt thiết bị', en: 'Book equipment' },
  'equipment.scheduleMaintenance': { vi: 'Lên lịch bảo trì', en: 'Schedule maintenance' },
  'equipment.edit': { vi: 'Chỉnh sửa', en: 'Edit' },
  'equipment.techInfo': { vi: 'Thông tin kỹ thuật', en: 'Technical Information' },
  'equipment.locatedLab': { vi: 'Phòng chứa', en: 'Lab Room' },
  'equipment.code': { vi: 'Mã thiết bị', en: 'Equipment Code' },
  'equipment.specs': { vi: 'Model / thông số', en: 'Model / Specs' },
  'equipment.noSpecs': {
    vi: 'Chưa cập nhật thông số kỹ thuật.',
    en: 'Technical specs not updated yet.',
  },
  'equipment.usageGuideline': { vi: 'Hướng dẫn sử dụng', en: 'Usage Guidelines' },
  'equipment.defaultGuideline': {
    vi: 'Liên hệ LabManager để được hướng dẫn.',
    en: 'Contact LabManager for guidelines.',
  },
  'equipment.next30Days': { vi: 'Lịch 30 ngày tới', en: 'Schedule for Next 30 Days' },
  'equipment.scheduleSubtitle': {
    vi: 'Booking và bảo trì của thiết bị',
    en: 'Equipment bookings & maintenance',
  },
  'equipment.viewAll': { vi: 'Xem toàn bộ', en: 'View all' },
  'equipment.emptyScheduleTitle': { vi: 'Lịch đang trống', en: 'Schedule is empty' },
  'equipment.emptyScheduleMsg': {
    vi: 'Thiết bị chưa có sự kiện trong 30 ngày tới.',
    en: 'No events scheduled for this equipment in the next 30 days.',
  },
  'equipment.maintenanceHistory': { vi: 'Lịch sử bảo trì', en: 'Maintenance History' },
  'equipment.maintenanceHistorySub': {
    vi: 'Các lịch bảo trì gắn với thiết bị',
    en: 'Maintenance records linked to this equipment',
  },
  'equipment.emptyMaintenanceTitle': { vi: 'Chưa có lịch bảo trì', en: 'No maintenance history' },
  'equipment.emptyMaintenanceMsg': {
    vi: 'Thiết bị chưa có bản ghi bảo trì.',
    en: 'No maintenance records found for this equipment.',
  },

  // Lab names, locations, and descriptions (Dynamic translations)
  'Phòng thí nghiệm điện tử': { vi: 'Phòng thí nghiệm điện tử', en: 'Electronics Lab' },
  'Phòng thí nghiệm sinh học': { vi: 'Phòng thí nghiệm sinh học', en: 'Biology Lab' },
  'Phòng thực hành mạng': { vi: 'Phòng thực hành mạng', en: 'Network Practice Lab' },
  'Tầng 2 - Tòa B': { vi: 'Tầng 2 - Tòa B', en: '2nd Floor - Building B' },
  'Tầng 4 - Tòa C': { vi: 'Tầng 4 - Tòa C', en: '4th Floor - Building C' },
  'Tầng 3 - Tòa A': { vi: 'Tầng 3 - Tòa A', en: '3rd Floor - Building A' },
  'Phòng đo kiểm mạch điện, tín hiệu và linh kiện điện tử.': {
    vi: 'Phòng đo kiểm mạch điện, tín hiệu và linh kiện điện tử.',
    en: 'Room for testing electronic circuits, signals, and components.',
  },
  'Tắt nguồn thiết bị sau khi sử dụng; báo ngay khi có sự cố.': {
    vi: 'Tắt nguồn thiết bị sau khi sử dụng; báo ngay khi có sự cố.',
    en: 'Turn off power after use; report immediately in case of issues.',
  },
  'Kính hiển vi quang học hai mắt, độ phóng đại tối đa 1000x': {
    vi: 'Kính hiển vi quang học hai mắt, độ phóng đại tối đa 1000x',
    en: 'Binocular optical microscope, maximum magnification 1000x',
  },
  'Lau vật kính bằng giấy chuyên dụng sau khi sử dụng.': {
    vi: 'Lau vật kính bằng giấy chuyên dụng sau khi sử dụng.',
    en: 'Wipe objective lens with dedicated lens paper after use.',
  },
  'Chưa có hạng mục chính sách nào.': {
    vi: 'Chưa có hạng mục chính sách nào.',
    en: 'No policy categories available.',
  },
  'Chưa có hành vi nào trong hạng mục này.': {
    vi: 'Chưa có hành vi nào trong hạng mục này.',
    en: 'No items in this category.',
  },

  // Equipment specs & guidelines dynamic translations
  'Bộ lưu điện bảo vệ workstation': {
    vi: 'Bộ lưu điện bảo vệ workstation',
    en: 'Workstation protection UPS',
  },
  'Bo mạch Arduino tích hợp Wi-Fi': {
    vi: 'Bo mạch Arduino tích hợp Wi-Fi',
    en: 'Wi-Fi enabled Arduino board',
  },
  'Kiểm tra tình trạng trước khi dùng; báo quản lý phòng nếu phát hiện bất thường.': {
    vi: 'Kiểm tra tình trạng trước khi dùng; báo quản lý phòng nếu phát hiện bất thường.',
    en: 'Check equipment status before use; report any anomalies to lab manager.',
  },
  'Quản trị viên Hùng': { vi: 'Quản trị viên Hùng', en: 'System Admin Hung' },
  'Quản trị viên': { vi: 'Quản trị viên', en: 'System Admin' },
  'Quản lý phòng': { vi: 'Quản lý phòng', en: 'Lab Manager' },
  'Người dùng': { vi: 'Người dùng', en: 'Requester' },
  'Sinh viên': { vi: 'Sinh viên', en: 'Student' },
  'Công nghệ thông tin': { vi: 'Công nghệ thông tin', en: 'Information Technology' },
  'Điện - Điện tử': { vi: 'Điện - Điện tử', en: 'Electrical & Electronic Engineering' },
  'Sinh học': { vi: 'Sinh học', en: 'Biology' },
  'Vật lý': { vi: 'Vật lý', en: 'Physics' },
  'equipment.underMaintenanceTitle': {
    vi: 'Thiết bị này hiện đang có lịch bảo trì / tạm dừng hoạt động',
    en: 'This equipment is currently scheduled for maintenance / paused',
  },
  'equipment.underMaintenanceMsg': {
    vi: 'Không thể đăng ký mượn thiết bị này cho đến khi kết thúc bảo trì.',
    en: 'Cannot book this equipment until maintenance is completed.',
  },
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
