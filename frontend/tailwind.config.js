/** AlgoLift shared design tokens for Tailwind utilities. */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: { bg:'var(--color-bg)', surface:'var(--color-surface)', hover:'var(--color-hover)', text:'var(--color-text)', 'text-secondary':'var(--color-text-secondary)', 'text-muted':'var(--color-text-muted)', accent:'var(--color-accent)', 'accent-light':'var(--color-accent-light)', 'accent-hover':'var(--color-accent-hover)', border:'var(--color-border)', success:'var(--color-success)', warning:'var(--color-warning)', danger:'var(--color-danger)' },
    fontFamily: { heading:['Space Grotesk','sans-serif'], body:['Inter','system-ui','sans-serif'], mono:['JetBrains Mono','monospace'] },
    fontSize: { 'page-title':'25px', 'section-title':'17px', metric:'27px', 'metric-hero':'35px', body:'16px', 'body-small':'15px', label:'12px' },
    spacing: { sidebar:'232px', topbar:'50px', content:'22px', card:'14px', module:'14px', compact:'8px' },
    borderRadius: { card:'3px', button:'3px', tag:'3px', track:'2px' },
    borderWidth: { DEFAULT:'1px', control:'1.5px' },
  } },
};
