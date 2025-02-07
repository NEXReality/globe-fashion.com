// import { loadSockConfiguration } from "./script.js";
// // import { handleColorChange, readLogo, getLogosInfo, loadInitialConfig, takeScreenshot} from "./threeD-script.js";

// // // Part selector with settings toggle
// // const partButtons = document.querySelectorAll('.part-button');
// // const footSettings = document.querySelector('.foot-settings');
// // const legSettings = document.querySelector('.leg-settings');
// // const cuffSettings = document.querySelector('.cuff-settings');

// const SUPABASE_URL = 'https://jvuibcqogyyffylvfeog.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dWliY3FvZ3l5ZmZ5bHZmZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMjg3MzUsImV4cCI6MjA1MTkwNDczNX0.iIu6f3LwdLmHoHmuVjbuVm-uLCDWA3oGZ7J07wXGBBU';
// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// // partButtons.forEach(button => {
// //     button.addEventListener('click', () => {
// //         // Update active button
// //         partButtons.forEach(btn => btn.classList.remove('active'));
// //         button.classList.add('active');
        
// //         // Show/hide appropriate settings
// //         const part = button.textContent.toLowerCase();
// //         footSettings.style.display = part === 'foot' ? 'block' : 'none';
// //         legSettings.style.display = part === 'leg' ? 'block' : 'none';
// //         cuffSettings.style.display = part === 'cuff' ? 'block' : 'none';
// //     });
// // });

// // // Color selector functionality
// // function setupColorSelector(selector) {
// //     const trigger = selector.querySelector('.color-trigger');
// //     const grid = selector.querySelector('.color-grid');
// //     const preview = trigger.querySelector('.color-preview');

// //     if (!trigger || !grid || !preview) {
// //         console.error('Missing elements for color selector:', selector);
// //         return;
// //     }

// //     trigger.addEventListener('click', (e) => {
// //         e.stopPropagation();
// //         const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
// //         trigger.setAttribute('aria-expanded', !isExpanded);
// //         grid.style.display = isExpanded ? 'none' : 'grid';
// //     });

// //     grid.querySelectorAll('.color-option').forEach(option => {
// //         option.addEventListener('click', (e) => {
// //             e.stopPropagation();
// //             const color = option.style.backgroundColor;
// //             const colorNumber = option.dataset.color;
            
// //             preview.style.backgroundColor = color;
// //             preview.textContent = colorNumber;
// //             preview.dataset.color = colorNumber;
            
// //             // 3D Color Change
// //             handleColorChange(color, selector.id);

// //             // Special case 1 - Foot (Change Color of Sole and Elastic Rib too)
// //             if (selector.id == "foot-color") {
// //                 let soleColorPreview = document.querySelector('#sole-color .color-preview');
// //                 let elasticRibFootColorPreview = document.querySelector('#elastic-rib-foot-color .color-preview');

// //                 soleColorPreview.style.backgroundColor = color;
// //                 soleColorPreview.textContent = colorNumber;
// //                 soleColorPreview.dataset.color = colorNumber;
// //                 elasticRibFootColorPreview.style.backgroundColor = color;
// //                 elasticRibFootColorPreview.textContent = colorNumber;
// //                 elasticRibFootColorPreview.dataset.color = colorNumber;
// //             }
// //             // Special case 2 - Leg (Change Color of Elastic Rib too)
// //             if (selector.id == "leg-color") {
// //                 let elasticRibLegColorPreview = document.querySelector('#elastic-rib-leg-color .color-preview');

// //                 elasticRibLegColorPreview.style.backgroundColor = color;
// //                 elasticRibLegColorPreview.textContent = colorNumber;
// //                 elasticRibLegColorPreview.dataset.color = colorNumber;
// //             }
            
// //             grid.style.display = 'none';
// //             trigger.setAttribute('aria-expanded', 'false');
// //         });
// //     });
// // }

// // // Set up all color selectors
// // document.querySelectorAll('.color-selector').forEach(setupColorSelector);

// // // Close color grid when clicking outside
// // document.addEventListener('click', (e) => {
// //     if (!e.target.closest('.color-selector')) {
// //         document.querySelectorAll('.color-grid').forEach(grid => {
// //             if (grid) {
// //                 grid.style.display = 'none';
// //                 const trigger = grid.closest('.color-selector')?.querySelector('.color-trigger');
// //                 if (trigger) {
// //                     trigger.setAttribute('aria-expanded', 'false');
// //                 }
// //             }
// //         });
// //     }
// // });

// // // Hide color grids on page load
// // document.addEventListener('DOMContentLoaded', () => {
// //     document.querySelectorAll('.color-grid').forEach(grid => {
// //         grid.style.display = 'none';
// //     });
    
// //     // Show initial section (Foot)
// //     footSettings.style.display = 'block';
// //     legSettings.style.display = 'none';
// //     cuffSettings.style.display = 'none';
// // });

// // // Range input value display
// // document.querySelectorAll('.range-input').forEach(input => {
// //     const valueDisplay = input.nextElementSibling;
// //     if (valueDisplay) {
// //         input.addEventListener('input', () => {
// //             let suffix = '';
// //             const label = input.parentElement.querySelector('.input-label')?.textContent || '';
// //             if (label.includes('mm')) {
// //                 suffix = ' mm';
// //             } else if (label.includes('cm')) {
// //                 suffix = ' cm';
// //             } else if (label.includes('degrees')) {
// //                 suffix = '°';
// //             } else if (label.includes('Scale')) {
// //                 suffix = 'x';
// //             }
// //             valueDisplay.textContent = input.value + suffix;
// //         });
// //     }
// // });

// // // Logo upload handling
// // const logoUpload = document.getElementById('logo-upload');
// // const uploadArea = document.querySelector('.logo-upload-area');

// // if (uploadArea) {
// //     uploadArea.addEventListener('dragover', (e) => {
// //         e.preventDefault();
// //         uploadArea.style.borderColor = 'var(--color-primary)';
// //     });

// //     uploadArea.addEventListener('dragleave', () => {
// //         uploadArea.style.borderColor = 'var(--color-border)';
// //     });

// //     uploadArea.addEventListener('drop', (e) => {
// //         e.preventDefault();
// //         uploadArea.style.borderColor = 'var(--color-border)';
// //         const file = e.dataTransfer.files[0];
// //         if (file && file.type === 'image/png') {
// //             handleLogoFile(file);
// //         }
// //     });
// // }

// // if (logoUpload) {
// //     logoUpload.addEventListener('change', (e) => {
// //         const file = e.target.files[0];
// //         if (file) {
// //             handleLogoFile(file);
// //         }
// //     });
// // }

// // function handleLogoFile(file) {
// //     console.log('Logo file uploaded:', file.name);
// // }




// // functions that is unique for this page. Do not merge this with script.js fuctions

// function getShortCodeFromUrl() {
//     const urlParams = new URLSearchParams(window.location.search);
//     return urlParams.get('shortCode');
// }

// async function fetchDesignData(shortCode) {
//     const { data, error } = await supabase
//         .from('user_files')
//         .select('design_name, custom_name, design_metadata, short_code, id')
//         .eq('short_code', shortCode)
//         .single();

//     if (error) {
//         console.error('Error fetching design data:', error);
//         return null;
//     }

//     return data;
// }

// async function updateDesignDetails() {
//     const shortCode = getShortCodeFromUrl();
//     if (shortCode) {
//         const designData = await fetchDesignData(shortCode);
//         if (designData) {
//             console.log('Design Name:', designData.custom_name || designData.design_name);
//             console.log('Design Metadata:', designData.design_metadata);
//             const panelTitle = document.querySelector('.panel-title');
//             panelTitle.textContent = designData.custom_name || designData.design_name;

//             localStorage.setItem('sockConfig', JSON.stringify(designData.design_metadata)); //JSON.stringify needed for localStorage

//             loadSockConfiguration(true);
//         } else {
//             console.log('Design not found');
//         }
//     } else {
//         console.log('No shortCode provided in URL');
//     }
// }

// // Call updateDesignDetails when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//     updateDesignDetails();
// });

// // Function to download JSON
// function downloadDesignJSON(data, filename) {
//     const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
//     const link = document.createElement("a")
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob)
//       link.setAttribute("href", url)
//       link.setAttribute("download", filename)
//       link.style.visibility = "hidden"
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//     }
//   }
  
//   // Function to handle the download
//   async function handleDownload() {
//     try {
//       const shortCode = getShortCodeFromUrl()
  
//       const data = await fetchDesignData(shortCode)
  
//       if (data && data.design_metadata) {
//         downloadDesignJSON(data.design_metadata, `sock_configuration_${shortCode}.json`)
//       } else {
//         console.log("No design metadata found for the given short code")
//       }
//     } catch (error) {
//       console.error("Error downloading design metadata:", error)
//     }
//   }
  
//   // event listener
//      const saveButton = document.getElementById("save-button")
//     if (saveButton) {
//       saveButton.addEventListener("click", handleDownload)
//     } else {
//       console.error("Save button not found")
//     }