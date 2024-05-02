// function mobileNav() {

//   const sidebarOpen = document.getElementById('sidebarToggle');
//   const sidebarClose = document.getElementById('sidebarClose');

//   const nav = document.getElementById('mobileNav');

//   const body = document.body;
//   const page = document.getElementById('root');


// /*Fucntion for showing sidebar & page fade mask */

//   function showSidebar() {

//     let mask = document.createElement('div');
//     mask.classList.add('fade');

//     setTimeout(() => {
//       mask.style.opacity = '1';
//       mask.style.pointerEvents = 'all';
//     }, 1);

//     mask.addEventListener('click', closeSidebar);
//     page.appendChild(mask);

//     body.classList.add('show-sidebar');
//     nav.classList.add('active');

//   };

// /*Function for closing sidebar & removing page fade mask */

//   function closeSidebar() {

//     let fadeMask = document.querySelector('.fade');
//     fadeMask.removeAttribute('style');

//     setTimeout(() => {
//       fadeMask.remove();
//     }, 200);

//     body.removeAttribute('class');
//     body.classList.remove('show-sidebar');
//     nav.classList.remove('active');

//   };

// /*Open sidebar on click if it hasn't been closed otherwise close it */

//   sidebarOpen.addEventListener('click', e => {

//     if(body.classList.contains('show-sidebar')){
//       closeSidebar();
//     } else {
//       showSidebar();
//     };

//   });

// /*Close sidebar on click if it hasn't been opened, otherwise open it  */

//   sidebarClose.addEventListener('click', e => {

//     if(body.classList.contains('show-sidebar')){
//       closeSidebar();
//     } else {
//       showSidebar();
//     };

//   });

// };

// export default mobileNav;