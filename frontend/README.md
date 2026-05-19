# DNA Sequence Analyzer - Frontend

Professional Next.js frontend for DNA sequence analysis with premium design and smooth interactions.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home page
│   ├── analyzer/
│   │   └── page.tsx             # Analyzer page
│   ├── docs/
│   │   └── page.tsx             # Documentation
│   └── layout.tsx               # Root layout
│
├── components/                  # Reusable React components
│   ├── Header.tsx              # Navigation header
│   ├── Button.tsx              # Premium button
│   ├── FeatureCard.tsx         # Feature showcase
│   ├── StatCard.tsx            # Metric display
│   ├── NucleotideChart.tsx     # Visualization
│   ├── SettingsPanel.tsx       # Settings sidebar
│   ├── ExportDialog.tsx        # Export options
│   ├── AnalysisHistory.tsx     # Recent analyses
│   ├── SequenceComparison.tsx  # Comparison tool
│   ├── AnalysisSkeleton.tsx    # Loading state
│   ├── ErrorBoundary.tsx       # Error handling
│   ├── FeaturesShowcase.tsx    # Feature list
│   └── index.ts                # Component exports
│
├── lib/                         # Utilities and hooks
│   ├── api.ts                  # API client
│   ├── hooks.ts                # Custom React hooks
│   ├── utils.ts                # Utility functions
│   └── types.ts                # TypeScript types
│
├── styles/
│   └── globals.css             # Global styles & design system
│
├── public/                      # Static assets
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.js              # Next.js configuration
```

## 🎨 Design System

### Colors
- **Primary**: Cyan (#06b6d4)
- **Secondary**: Purple (#a855f7)
- **Accent**: Teal (#14b8a6), Indigo (#6366f1), Emerald (#10b981)
- **Background**: Slate-950 (#0f172a)

### Components
- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: Glass-morphism with backdrop blur
- **Charts**: Custom SVG visualizations
- **Animations**: Framer Motion for smooth transitions

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run build        # Build for production
npm start            # Start production server
```

## 📦 Dependencies

### Core
- **next**: 14.2.0 - React framework
- **react**: 18.3.1 - UI library
- **typescript**: 5.4.0 - Type safety

### Styling
- **tailwindcss**: 3.4.0 - Utility CSS
- **postcss**: 8.2.15 - CSS processing

### Animations
- **framer-motion**: 10.16.16 - Animation library

### UI
- **lucide-react**: 0.408.0 - Icon library
- **react-hot-toast**: 2.4.1 - Notifications
- **clsx**: 2.1.1 - Class utilities

### State
- **zustand**: 4.4.7 - State management

## 🎯 Features

### Pages
- **Home**: Hero section, features, how-it-works
- **Analyzer**: Sequence input, analysis, results
- **Documentation**: API reference, guides

### Components
- Premium buttons with loading states
- Feature cards with animations
- Stat cards with color coding
- Nucleotide composition charts
- Expandable sections
- Settings panel
- Export dialog
- Analysis history
- Sequence comparison
- Error boundary
- Loading skeleton

### Utilities
- API client with error handling
- Custom React hooks
- FASTA parser and formatter
- Validation functions
- Formatting utilities

## 🔌 API Integration

### Endpoints
- `POST /api/analyze` - Analyze sequences
- `GET /api/health` - Health check

### Usage
```typescript
import { apiClient } from '@/lib/api'

const results = await apiClient.analyze({
  sequence: 'ATGCATGC...',
  type: 'raw'
})
```

## 🎨 Styling

### Tailwind Classes
- Use predefined color palette
- Glass-morphism: `glass`, `glass-dark`, `glass-light`
- Buttons: `btn-primary`, `btn-secondary`
- Inputs: `input-premium`
- Cards: `card`
- Code: `code-block`

### Custom CSS
Global styles in `styles/globals.css`:
- Gradient text
- Glass effects
- Premium buttons
- Animations

## 🧪 Testing

```bash
npm run lint         # Lint code
npm run build        # Check build
```

## 📱 Responsive Design

- Mobile: 375px+
- Tablet: 768px+
- Desktop: 1024px+

All components are fully responsive with proper breakpoints.

## ♿ Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast
- Focus states

## 🚀 Performance

- Code splitting
- Image optimization
- CSS optimization
- Fast page loads
- Smooth animations

## 🔒 Security

- Input validation
- XSS prevention
- CORS handling
- Secure API calls

## 📚 Documentation

- Inline code comments
- Component documentation
- API documentation
- Utility documentation

## 🐛 Troubleshooting

### Port already in use
```bash
npm run dev -- -p 3001
```

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

### API connection issues
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running
- Check CORS configuration

## 📝 Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [TypeScript](https://www.typescriptlang.org)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review error messages
3. Check browser console
4. Review API logs

---

**Version**: 1.0.0  
**Status**: Production Ready ✅
