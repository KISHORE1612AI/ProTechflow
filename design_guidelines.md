# Design Guidelines: Team Task Management & Analytics Dashboard

## Design Approach

**Framework**: Design System Approach (Material Design principles adapted for productivity tools)

**Primary Inspiration**: Linear, Notion, and Asana - modern productivity tools emphasizing clarity, data density, and efficient workflows. This dashboard prioritizes **function over aesthetics** while maintaining professional polish.

**Core Principles**:
- Information density with breathing room
- Instant visual hierarchy for task prioritization
- Consistency across all interactive elements
- Performance-focused micro-interactions

---

## Typography System

**Font Stack**: 
- Primary: `Inter` (via Google Fonts CDN) - clean, modern, excellent at small sizes
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui`

**Type Scale**:
- Page Titles: 2xl (24px), font-semibold
- Section Headers: xl (20px), font-semibold
- Card Titles: base (16px), font-medium
- Body Text: sm (14px), font-normal
- Meta Information: xs (12px), font-normal
- Navigation Items: sm (14px), font-medium

---

## Layout System

**Spacing Units**: Tailwind units of **2, 3, 4, 6, 8, 12, 16** (e.g., `p-4`, `gap-6`, `mt-8`)

**Application Shell**:
- **Top Navigation**: Fixed height of `h-16`, spans full width with `px-6` horizontal padding
- **Left Sidebar**: Fixed width `w-64` on desktop, collapsible to `w-16` icon-only mode, full-height with `py-6 px-4`
- **Main Content Area**: Flexible width, `p-6` padding, accommodates horizontal scroll for Kanban
- **Right Drawer**: Fixed width `w-96`, slides in from right, full-height with `p-6`

**Grid Systems**:
- Analytics Charts: 3-column grid on desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Kanban Columns: Horizontal flex with `gap-4`, each column `w-80` (320px)
- Task Cards: Stacked vertically with `gap-3` within columns

---

## Component Library

### Navigation Components

**Top Navigation Bar**:
- Logo/brand on left (text or small icon + text)
- Search bar centered (`max-w-md`) with subtle border
- Right section: View toggle buttons (Board/Analytics), notification icon, user avatar with dropdown
- Divider line at bottom (`border-b`)

**Left Sidebar**:
- Section headers with `text-xs uppercase tracking-wide` 
- Navigation items: `py-2 px-3 rounded-lg`, hover state with subtle background
- Active state: teal/indigo accent background with white text
- Project list with small project icons/avatars
- Quick filters section (My Tasks, Due Soon, Overdue) with count badges

### Kanban Board Components

**Status Columns**:
- Header: status name + task count badge, action button (+ Add Task)
- Container: `bg-slate-50` rounded background, `p-4`, minimum height to show empty state
- Drop zone: dashed border when dragging over

**Task Cards**:
- Contained card design: `bg-white`, `rounded-lg`, `shadow-sm`, `p-4`
- Priority indicator: left border accent (`border-l-4`) - red (high), yellow (medium), blue (low)
- Card header: task title (font-medium) + priority badge
- Assignee avatar(s): small circular images (`w-6 h-6`) in bottom-left
- Due date: text-xs with calendar icon in bottom-right
- Hover state: `shadow-md` elevation increase
- Drag handle: subtle grip icon appears on hover (top-right)

### Forms & Modals

**Task Creation/Edit Modal**:
- Overlay: semi-transparent dark backdrop
- Modal: `max-w-2xl`, `bg-white`, `rounded-xl`, `p-6`
- Form fields stacked vertically with `space-y-4`
- Input fields: `border rounded-lg px-4 py-2`, focus state with teal ring
- Dropdowns/Selects: custom styled with icons (priority, assignee, project)
- Action buttons: right-aligned, primary (teal) + secondary (ghost/outline)

### Analytics Components

**Chart Containers**:
- Card wrapper: `bg-white`, `rounded-xl`, `p-6`, `shadow-sm`
- Chart title: text-lg font-semibold with subtitle/description below
- Filter controls above charts: date range picker, project selector (horizontal layout)
- Consistent padding between chart and container edges

**Chart Styling** (Chart.js configuration):
- Line charts: smooth curves, single accent color (teal), subtle grid lines
- Bar charts: rounded corners, teal bars, adequate spacing
- Doughnut/Pie: accent color palette (teal, indigo, slate variations), centered legend

### Interactive Elements

**Buttons**:
- Primary: `bg-teal-600 text-white rounded-lg px-4 py-2`, hover: `bg-teal-700`
- Secondary: `border border-slate-300 bg-white rounded-lg px-4 py-2`, hover: subtle background
- Icon-only: `w-10 h-10 rounded-lg`, hover background
- Consistent `font-medium` weight

**Badges**:
- Pill-shaped: `rounded-full px-3 py-1 text-xs font-medium`
- Priority: high (red bg), medium (yellow bg), low (blue bg) with contrasting text
- Count badges: small circular, background accent, white text

**Avatars**:
- Circular with user initials or photo
- Sizes: xs (`w-6 h-6`), sm (`w-8 h-8`), md (`w-10 h-10`)
- Stack with slight overlap (`-ml-2`) for multiple assignees

### Right Task Detail Drawer

**Structure**:
- Header: task title (editable), close button
- Priority & status selectors: inline at top
- Sections: Description, Assignee, Due Date, Labels, Comments (with avatars + timestamps)
- Activity timeline: chronological list with icons for actions
- Footer: action buttons (Delete, Save Changes)

---

## Micro-Interactions & Animations

**Drag & Drop** (react-beautiful-dnd):
- Lifting: scale up slightly (`scale-105`), add stronger shadow
- Dragging: reduce opacity of placeholder, show drop zones with dashed borders
- Drop: smooth transition back to position

**State Transitions**:
- Modal open/close: fade + scale (`transition-all duration-200`)
- Drawer slide: translate animation (`transition-transform duration-300`)
- Toast notifications: slide in from top-right, auto-dismiss after 3s

**Hover States**:
- Cards: elevation increase (shadow change)
- Buttons: subtle background darkening
- Navigation items: background tint

**Loading States**:
- Skeleton screens for task cards: pulsing gray rectangles
- Spinner for data fetching: centered teal spinner
- Button loading: replace text with spinner, maintain button width

---

## Responsive Behavior

**Breakpoints**:
- Mobile (<768px): Collapse sidebar to icon-only, Kanban columns stack vertically or horizontal scroll, hide right drawer initially
- Tablet (768-1024px): Sidebar visible but narrower, Kanban scrolls horizontally, analytics 2-column grid
- Desktop (1024px+): Full layout, 3-column analytics, comfortable Kanban spacing

**Mobile Optimizations**:
- Top nav: hamburger menu replaces sidebar toggle
- Task cards: slightly reduced padding, hide secondary info
- Modals: full-screen on small devices
- Bottom navigation bar for quick access (Board, Analytics, Add Task)

---

## Accessibility

- Form inputs: visible labels, ARIA labels, error states with red border + message
- Focus indicators: 2px teal ring on all interactive elements
- Color contrast: minimum WCAG AA (4.5:1 for text)
- Keyboard navigation: tab order follows visual hierarchy, ESC to close modals
- Screen reader: semantic HTML, ARIA landmarks for regions

---

## Icon System

**Library**: Lucide React (via CDN)
**Usage**:
- Navigation: Home, Calendar, Users, Settings icons
- Task actions: Plus, Edit, Trash, MoreVertical
- Status: Check, Circle, AlertCircle
- Priority: ArrowUp, Minus, ArrowDown
- Size: `w-5 h-5` for most contexts, `w-4 h-4` for compact areas

---

## Images

**No hero images** - This is a functional dashboard application, not a marketing site. All visuals are data-driven (charts, graphs, user avatars, task metadata).

**Avatar/Profile Images**: User-uploaded or generated initials on colored backgrounds. Assignee avatars appear on task cards and in comment threads.