window.onload = async() => {
    const data = await fetch(new Request('../fake-api/cncMaterials.json'))
    const materials = await data.json()

    // sort by `orderWithinTechnology` to match original website
    materials.sort((a, b) => a.orderWithinTechnology - b.orderWithinTechnology)

    // create material section lists
    const metalList = document.getElementById('metals-list')
    const platicsList = document.getElementById('plastics-list')

    materials.forEach(material => {
        // generate html entry item
        const entry = createMaterialItem(material)

        // add entry to list
        material.materialType.slug === 'metal' ? metalList.appendChild(entry) : platicsList.appendChild(entry)
    })
}

/**
 * ------------------------------------
 * MAIN PAGE FUNCTIONS
 * ------------------------------------
 */

/**
 * Will create an item listing for the given material.
 * 
 * @param {material} material material object. 
 * @returns {HTMLElement} Item listing.
 */
function createMaterialItem(material) {
    const { name, subsets, headerImage } = material

    // 1. material name
    const typeText = subsets.length === 1 ? 'type' : 'types'
    const type = createAndAppend('span', `(${subsets.length} ${typeText})`)

    // 2. material image
    const img = document.createElement('img')
    // set image to match as much as possible the template
    img.src = headerImage.file.url + '?w=350&h=250&f=right&fit=thumb'
    img.alt = name

    // create item element
    const entry = createAndAppend('p', name, type, img)

    // add onclick event
    entry.onclick = () => {
        shadow.style.visibility = 'visible'
        document.querySelector('body').style.overflow = 'hidden'

        const bottomAction = createSidebarBottomAction()
        const content = createSidebarMaterialDetailsPage(material)

        renderSidebar(null, content, bottomAction, 'material-list-item-sidebar-main')
    }

    return entry
}

/**
 * ------------------------------------
 * SIDEBAR SHADOW FUNCTION
 * ------------------------------------
 */

const shadow = document.getElementById('material-list-shadow')
shadow.onclick = () => {
    document.getElementById('material-list-item-sidebar-details')?.remove()
    document.getElementById('material-list-item-sidebar-main')?.remove()
    document.querySelector('body').style.overflow = 'auto'
    shadow.style.visibility = 'hidden'
}

/**
 * ------------------------------------
 * SIDEBAR FUNCTIONS
 * ------------------------------------
 */

/**
 * Renders the sidebar with the given `HTLMElement`
 * `sidenavId` is used to identify which sidebar layer is being shown.
 * This is to know which one to close.
 * 
 * When looking at the material subset details sidebar page, pressing the *go back* arrow
 * will close the subset details page.
 * 
 * When looking at any of the sidebar page (main & subset details), pressing the *close* button
 * will close all sidebar pages.
 * 
 * @param {HTLMElement} top top sidebar navigation actions.
 * @param {HTMLElement} content content of the sidebar.
 * @param {HTMLElement} bottom bottom sidebar navigation actions.
 * @param {string} sidenavId sidebar id.
 */
function renderSidebar(top, content, bottom, sidenavId) {
    // create sidebar container
    const sidebar = createWithClass('div', 'material-list-item-sidebar')
    sidebar.setAttribute('id', sidenavId)

    // construct sidebar
    if (top) sidebar.appendChild(top)
    if (content) sidebar.appendChild(content)
    if (bottom) sidebar.appendChild(bottom)

    // append to document
    document.getElementById('materials-list')?.appendChild(sidebar)
}

/**
 * Will create the main sidebar page of the given material.
 * 
 * @param {material} material material object.
 * @returns {HTMLElement} Material details page.
 */
function createSidebarMaterialDetailsPage(material) {
    const { name, subsets, headerImage, longDescription } = material

    // 1. material image
    const image = createWithClass('div', 'material-list-item-sidebar-image')
    image.innerHTML = `<img src="${headerImage.file.url + '?w=385'}">`

    // 2. material name
    const title = createAndAppend('h3', name)

    // 3. material description
    const description = createWithClassAndAppend('p', 'material-list-item-sidebar-description', longDescription)

    const subsetEntry = subsetName => {
        const subsetTitle = createAndAppend('p', subsetName)
        const backBtn = createWithClassAndAppend('i', 'material-icons', 'keyboard_arrow_right')

        const item = createWithClass('div', 'material-list-item-sidebar-item')
        item.appendChild(subsetTitle)
        item.appendChild(backBtn)

        item.onclick = () => {
            const bottomAction = createSidebarBottomAction()
            const content = createSidebarSubsetDetailsPage(subsets[0])
            const topAction = createSidebarTopAction(name)

            renderSidebar(topAction, content, bottomAction, 'material-list-item-sidebar-details')
        }

        return item
    }

    // create container with components
    const container = createWithClass('div', 'material-list-item-sidebar-content')
    container.appendChild(image)
    container.appendChild(title)
    container.appendChild(description)

    // 4. append subset entries
    subsets.forEach(subset => container.appendChild(subsetEntry(subset.name)))

    return container
}

/**
 * Will create the secondary (subset details) sidebar page.
 * 
 * @param {subet} subset subset object.
 * @returns {HTMLElement} Subset details page.
 */
function createSidebarSubsetDetailsPage(subset) {
    const { name, shortDescription } = subset

    // 1. material subset title
    const title = createAndAppend('h3', name)

    // 2. material subset description
    const description = createWithClassAndAppend('p', 'material-list-item-sidebar-description', shortDescription)

    const propertyEntry = (name, value) => {
        const nameTag = createAndAppend('p', name)
        const valueTag = createAndAppend('p', value)
        return createAndAppend('li', nameTag, valueTag)
    }

    const { yieldStrength, elongationAtBreak, hardness, corrosionResistance } = subset

    // 3. material subset properties list
    const properties = document.createElement('ul')
    properties.appendChild(propertyEntry('Ultimate Tensile Strength', '--'))
    properties.appendChild(propertyEntry('Young modulus', '--'))
    properties.appendChild(propertyEntry('Magnetism', '--'))
    properties.appendChild(propertyEntry('Hardness', hardness ?? '--'))
    properties.appendChild(propertyEntry('Corrosion resistance', corrosionResistance ?? '--'))
    properties.appendChild(propertyEntry('Weldability', '--'))
    properties.appendChild(propertyEntry('Yeild Strength', yieldStrength ?? '--'))
    properties.appendChild(propertyEntry('Elongation at Break', elongationAtBreak ?? '--'))

    const applicationEntry = field => createAndAppend('p', `• ${field}`)

    // 4. material subset applications list
    const applications = createWithClassAndAppend('div', 'material-list-item-sidebar-application')
    applications.appendChild(createAndAppend('p', 'Common applications'))
    applications.appendChild(applicationEntry('application 1'))
    applications.appendChild(applicationEntry('application 2'))
    applications.appendChild(applicationEntry('application 3'))

    // creating container with components
    const container = createWithClass('div', 'material-list-item-sidebar-content')
    container.appendChild(title)
    container.appendChild(description)
    container.appendChild(properties)
    container.appendChild(applications)

    return container
}

/**
 * Creates top action navigation actions with name as title.
 * 
 * @param {string} name material name.
 * @returns {HTMLElement} Top action container.
 */
function createSidebarTopAction(name) {
    // back button
    const backBtn = createWithClassAndAppend('i', 'material-icons', 'arrow_back')
    backBtn.onclick = () => {
        document.getElementById('material-list-item-sidebar-details')?.remove()
    }

    // title
    const title = createAndAppend('p', name)

    return createWithClassAndAppend('div', 'material-list-item-sidebar-top-actions', backBtn, title)
}

/**
 * Creates bottom action navigation actions.
 * 
 * @returns {HTMLElement} Top action container.
 */
function createSidebarBottomAction() {
    // 'get quote' button
    const getQuoteBtn = createWithClassAndAppend('button', 'button-small button button--primary', 'Get instant quote')

    // 'close' button
    const closeBtn = createWithClassAndAppend('button', 'button-small button button--secondary', 'Close')

    closeBtn.onclick = () => {
        document.getElementById('material-list-item-sidebar-details')?.remove()
        document.getElementById('material-list-item-sidebar-main')?.remove()
        document.querySelector('body').style.overflow = 'auto'
        shadow.style.visibility = 'hidden'
    }

    return createWithClassAndAppend('div', 'material-list-item-sidebar-bottom-actions', closeBtn, getQuoteBtn)
}

/**
 * ------------------------------------
 * HTML UTIL FUNCTIONS
 * ------------------------------------
 */

function createAndAppend(tag, ...content) {
    const container = document.createElement(tag)
    content.forEach(el => container.append(el))
    return container
}

function createWithClassAndAppend(tag, className, ...content) {
    const container = createWithClass(tag, className)
    content.forEach(el => container.append(el))
    return container
}

function createWithClass(tag, className) {
    const el = document.createElement(tag)
    el.setAttribute('class', className)
    return el
}
