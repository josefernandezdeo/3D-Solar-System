# 🍅 Cute Tomato Pomodoro Timer

A delightful mobile-first Pomodoro timer featuring an adorable animated tomato character! This app gamifies your productivity with a points system and beautiful mobile interface.

![Pomodoro Timer Preview](https://img.shields.io/badge/Status-Active-brightgreen) ![Version](https://img.shields.io/badge/Version-2.0.0-blue) ![Mobile](https://img.shields.io/badge/Mobile-Optimized-orange)

## ✨ Features

### 🎨 Beautiful Design
- **Cute Tomato Character**: Animated tomato with facial expressions and leaves
- **Mobile-First Interface**: Phone container design for authentic mobile feel
- **Coral Color Scheme**: Warm and inviting orange/coral theme
- **Smooth Animations**: Bouncing tomato and rotating progress indicators
- **Professional UI**: Clean, modern interface with glassmorphism effects

### ⏰ Timer Functionality
- **25-minute Focus Sessions**: Standard Pomodoro technique timing
- **Smart Break System**: 5-minute short breaks, 15-minute long breaks
- **Visual Progress**: Circular progress ring with animated dot
- **Session Tracking**: Automatic cycling between work and break periods
- **Customizable Timers**: Adjust focus, short break, and long break durations

### 🎮 Gamification
- **Points System**: Earn 25 points for each completed focus session
- **Visual Feedback**: Points badge prominently displayed
- **Achievement Notifications**: Encouraging messages for completed sessions
- **Progress Persistence**: Points saved locally and persist between sessions

### 🔧 Settings & Customization
- **Flexible Timing**: Customize all timer durations (1-60 minutes)
- **Sound Control**: Toggle notification sounds on/off
- **Local Storage**: All settings and progress automatically saved
- **Settings Modal**: Clean, accessible settings interface

### 📱 Mobile Features
- **Bottom Navigation**: Five-tab navigation (timeline, timer, garden, blacklist, usage)
- **Touch Optimized**: Large touch targets and mobile-friendly interactions
- **Wake Lock Support**: Prevents screen from sleeping during sessions (when supported)
- **Keyboard Shortcuts**: Spacebar to start/pause timer
- **Responsive Design**: Works perfectly on all screen sizes

### 🔔 Notifications
- **Browser Notifications**: Desktop notifications for session completion
- **Audio Alerts**: Optional sound notifications using Web Audio API
- **Smart Messages**: Different messages for work sessions, short breaks, and long breaks
- **Automatic Permission**: Requests notification permissions on first use

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/josefernandezdeo/pomodoro.git
   cd pomodoro
   ```

2. **Open in browser**:
   ```bash
   open index.html
   # or
   python -m http.server 8000  # for local server
   ```

3. **Start focusing**:
   - Click the "Start" button to begin your first Pomodoro session
   - Watch the cute tomato bounce while you work
   - Take breaks when prompted
   - Earn points and build productivity habits!

## 🎯 How to Use

### Basic Operation
1. **Start Timer**: Click the orange "Start" button or press Space
2. **Pause/Resume**: Click "Pause" or press Space again
3. **Complete Sessions**: Timer automatically switches between work and breaks
4. **Earn Points**: Get 25 points for each completed focus session

### Navigation
- **Timer**: Main timer interface (active by default)
- **Timeline**: Session history (coming soon)
- **Garden**: Your tomato garden visualization (coming soon)
- **Blacklist**: Distraction blocking features (coming soon)
- **Usage**: Statistics and analytics (coming soon)

### Settings Configuration
1. Click the "Settings" link below the start button
2. Adjust timer durations:
   - **Focus Time**: 1-60 minutes (default: 25)
   - **Short Break**: 1-30 minutes (default: 5)
   - **Long Break**: 1-60 minutes (default: 15)
3. Toggle sound notifications on/off
4. Click "Save" to apply changes

### Keyboard Shortcuts
- **Space**: Start/pause timer
- **Escape**: Close settings modal (when open)

## 🛠️ Technical Details

### Tech Stack
- **HTML5**: Semantic markup and structure
- **CSS3**: Advanced styling with animations and mobile-first design
- **Vanilla JavaScript**: Pure JS with ES6+ features, no frameworks
- **Web Audio API**: For notification sounds
- **Local Storage API**: For settings and progress persistence
- **Notifications API**: For desktop notifications
- **Wake Lock API**: To prevent screen sleep (when supported)

### Browser Compatibility
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile Support**: iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive Enhancement**: Graceful degradation for older browsers

### Performance Features
- **Lightweight**: Zero dependencies, minimal resource usage
- **Responsive**: Optimized for all screen sizes
- **Accessible**: Keyboard navigation and screen reader friendly
- **Fast Loading**: Optimized assets and efficient code

## 📂 Project Structure

```
pomodoro/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and animations
├── script.js           # Timer logic and interactions
└── README.md          # This documentation
```

### Key Components
- **Phone Container**: Creates mobile device appearance
- **Tomato Character**: Animated SVG-like character with CSS
- **Progress Ring**: SVG circular progress indicator
- **Settings Modal**: Overlay for configuration options
- **Bottom Navigation**: Mobile app-style navigation tabs

## 🎨 Design Philosophy

This Pomodoro timer embraces the philosophy of **delightful productivity**:

- **Friendly Design**: The cute tomato character makes productivity feel less intimidating
- **Mobile-First**: Designed primarily for mobile use, where most people struggle with focus
- **Gamification**: Points system provides motivation and sense of achievement
- **Visual Feedback**: Clear progress indicators and animations provide satisfying feedback
- **Minimal Complexity**: Simple interface that doesn't distract from the task at hand

## 🔮 Future Features

- **Garden Growth**: Tomatoes grow in your garden with each completed session
- **Achievement System**: Unlock new tomato varieties and decorations
- **Statistics Dashboard**: Detailed analytics of your productivity patterns
- **Session History**: Timeline view of past sessions and streaks
- **Distraction Blocking**: Website/app blacklist during focus sessions
- **Custom Themes**: Multiple color schemes and character options
- **Sync Across Devices**: Cloud storage for cross-device continuity

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Pomodoro Technique**: Created by Francesco Cirillo
- **Design Inspiration**: Modern mobile app design principles
- **Color Palette**: Warm, productivity-focused coral theme
- **Typography**: System fonts for optimal readability

---

**Happy focusing! 🍅✨**

*Made with ❤️ for productive people everywhere* 