import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light', // You can switch to 'dark' if needed

        primary: {
            main: '#204EC8',      // Night 700 (vibrant)
            light: '#2E52B2',     // Night 600
            dark: '#163787',      // Deeper variant
            contrastText: '#F0F0F0'
        },

        secondary: {
            main: '#FB7021',      // Sunset 500
            light: '#FF8E4F',     // Sunset 400 (approx.)
            dark: '#E25903',      // Deeper shade if needed
            contrastText: '#F0F0F0'
        },

        background: {
            default: '#F0F0F0',    // W
            paper: '#FFFFFF'
        },

        text: {
            primary: '#191919',    // Black Hole
            secondary: '#99a1af',  // G
        },
        
        grey: {
            200: '#D0D0D0',
            400: '#B0B0B0',
            600: '#6F6F6F',
        },
        
        success: {
            main: '#3EAC2C',
            light: '#6CC25E',
            dark: '#1D880F',
            contrastText: '#F0F0F0'
            
        },

        // Optional neutral/custom
        neutral: {
            main: '#99a1af',
            contrastText: '#5E5E5E',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
    }
});

export default theme;
