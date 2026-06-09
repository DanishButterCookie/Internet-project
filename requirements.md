# Internet Project Functional Requirements

## What Is This App?

A multi-page website that serves as a tool for composing styles for websites, and even offers a way to share styles and leave reviews on them.

---

## Technologies Used

HTML5: Page structure and content
CSS: Visual styling and layout
JavaScript: Client-side interactivity, data fetching and data posting
C# with .NET Minimal API: Web server and API endpoints

## *Note*
*No frameworks are used, neither the client nor the server.* 
This makes the website much simpler to create and easier to understand, which is achieved by avoiding complex and unnecessary overhead.

---

## Graphical Design Considerations

The design is meant to be relatively simple, while demonstrating on purpose examples of styles that are possible to design on the website itself.

---

## Tools available
*The following are 3 tools that will be included in the website*

### Color picker
Most basic tool for designing websites. It has a cube that can be moved over a fade of Red and Green values in the RGB color space, using its X and Y coordinates as the Red and Green values. the Blue value is controlled using a slider.

### Text picker
Another basic tool, used for choosing which text to use for each thing. will have a textbox for inputting sample text, along with being able to choose the size, bold, italic, underline, and type (h1, h2, title, etc...).

### Palette creator
A slightly more advanced tool, where you can scroll through pre-made palettes of 2 colors that will have a simple name, and choose them for your website. or you can create your own palette and post it for others to see, and see other's palettes. The creation process of a palette is super simple: write down 2 colors to put, and give a title. finally it will request a name under which you will post your palette. (no logins and accounts for now)

## Pages and What They Do

### Home (`index.html`)

The landing page. It orients the user and tells them how to use the site.

- Displays a welcome message with a brief description of the site's purpose.
- Shows the current amount of users online and how many total times the site has been visited. (for fun)

---

### About (`about.html`)

Explains what the purpose of the website is in futher detail, and explains how to use each tool and what its purpose is.

Describes what the goal of the site is, and its intended usage.
Contains a table showing each tool with its intended usage and a brief *how to*.

---

### Color picker (`color.html`)

A 2d canvas where you can drag a cube around, with a bar on the right showing a fade of blue.
below the canvas the page displays the color's code in hex and rgb, along side a button to copy each one.

---

### Text picker (`text.html`)

Shows a text at the top of the page, with a slider for text size along with a text next to it for showing the actual value, a dropdown menu for choosing the kind of text (regular, h1, h2, h3 etc..), bold and italic toggle buttons, and a font dropdown menu.

---

### Palettes (`palette.html`)

At the top of the page is scrollable container of pre-made palettes, below it a container of user made palettes showing the date at which it was posted, and below that container is the option to post a custom palette.

---

## Behaviour That Applies to Every Page

### Shared navigation header

Every page displays the same header at the top, containing:
The site title and a one-line description.
A navigation bar with five links: Home, About, Color picker, Text picker, Palettes.
The header is **not duplicated** in each HTML file. It is stored in a single separate file and loaded dynamically by JavaScript on every page.

### Active navigation highlight

The navigation link corresponding to the currently viewed page is automatically highlighted. This is set by JavaScript.

### Shared footer

Every page has an identical footer at the bottom stating my name as the creator, along with a link to the github repo of this website that has all the source files.

### Responsive layout

All pages adjust to small screens:
Navigation links stack vertically instead of sitting side by side.
Content fills the available width rather than being constrained to a fixed column.

---

## Data and State

*Online users counter*, tracked by the backend and sent to all users.
*Total site visits*, tracked by the backend and sent to all users.
*Premade palettes*, stored in the backend for easy updates.
*Usermade palettes*, also stored in the backend, and persists after restarts by utilizing JSON files locally, and OOP for the data structure of each palette posted.

---

## User Interactions

*Click a navigation link on any page's header to navigate between pages.
*Refresh page to refresh user and premade palettes on the Palettes page.
*Click github repository link in the footer at any page to visit the repo.
*Create a palette in the Palettes page and submit it, which sends it to the backend and reloads the page.

---

## What the App Does NOT Do

No user accounts or login.
No admin interface.
No client-side routing or single-page app behaviour.