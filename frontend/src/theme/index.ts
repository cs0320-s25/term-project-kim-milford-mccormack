import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light', // You can switch to 'dark' if needed

        primary: {
            main: '#183D9E',      // Night 700 (vibrant)
            light: '#2E52B2',     // Night 600
            dark: '#122C6A',      // Deeper variant
            contrastText: '#FFFFFF'
        },

        secondary: {
            main: '#F7411B',      // Sunset 500
            light: '#FF6B3D',     // Sunset 400 (approx.)
            dark: '#C53000',      // Deeper shade if needed
            contrastText: '#FFFFFF'
        },

        background: {
            default: '#F0F0F0',    // W
            paper: '#FFFFFF'
        },

        text: {
            primary: '#191919',    // Black Hole
            secondary: '#5E5E5E',  // G
        },

        // Optional neutral/custom
        neutral: {
            main: '#2F2F2F',
            contrastText: '#F0F0F0',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
    }
});

export default theme;
