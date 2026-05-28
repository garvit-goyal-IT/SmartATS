
export const globalResponsiveStyles = `
  * {
    box-sizing: border-box !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     FORCE RESPONSIVE ON ALL ELEMENTS
     ───────────────────────────────────────────────────────────────────── */
  
  /* All divs with style display: grid */
  div[style*="gridTemplateColumns"] {
    grid-template-columns: repeat(4, 1fr) !important;
  }
  
  /* TABLET - 1024px and below */
  @media (max-width: 1024px) {
    div[style*="gridTemplateColumns: repeat(4"] {
      grid-template-columns: repeat(3, 1fr) !important;
    }
    
    div[style*="gridTemplateColumns: repeat(7"] {
      grid-template-columns: repeat(3, minmax(260px, 1fr)) !important;
    }
  }
  
  /* MOBILE - 768px and below */
  @media (max-width: 768px) {
    div[style*="gridTemplateColumns"] {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    div[style*="padding: \\"28px\\""],
    div[style*="padding: 28px"] {
      padding: 16px !important;
    }
    
    h1 {
      font-size: 28px !important;
    }
    
    h2 {
      font-size: 22px !important;
    }
  }
  
  /* SMALL MOBILE - 480px and below (390px) */
  @media (max-width: 480px) {
    /* All grids to 1 column */
    div[style*="gridTemplateColumns"] {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
    
    /* Padding */
    div[style*="padding: \\"28px\\""],
    div[style*="padding: 28px"],
    div[style*="padding: 20px"] {
      padding: 12px !important;
    }
    
    /* Typography */
    h1 {
      font-size: 24px !important;
    }
    
    h2 {
      font-size: 20px !important;
    }
    
    h3 {
      font-size: 16px !important;
    }
    
    /* Flex stacking */
    div[style*="display: \\"flex\\""],
    div[style*="display: flex"] {
      flex-wrap: wrap !important;
    }
    
    /* Button & Input sizing */
    button, input, select, textarea {
      font-size: 16px !important;
      min-height: 44px !important;
      width: 100% !important;
    }
    
    /* Toolbar vertical */
    div[style*="display: \\"flex\\""][style*="gap"] {
      flex-direction: column !important;
    }
    
    /* Modal full-width */
    .modal, div[style*="position: \\"fixed\\""] {
      width: 100% !important;
      max-width: 100% !important;
      border-radius: 16px 16px 0 0 !important;
    }
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     UNIVERSAL FIXES (All breakpoints)
     ───────────────────────────────────────────────────────────────────── */
  
  img, svg {
    max-width: 100% !important;
    height: auto !important;
  }
  
  body {
    overflow-x: hidden !important;
  }
  
  /* Prevent zoom on mobile input focus */
  @media (max-width: 480px) {
    input, select, textarea, button {
      font-size: 16px !important;
    }
  }
`;

export default globalResponsiveStyles;