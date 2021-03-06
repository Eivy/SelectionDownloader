browser.menus.create({
	id: 'selection-download-item',
	title: 'Download selected items',
	contexts: ['selection']
})

browser.menus.create({
	id: 'download-item',
	title: 'Download link',
	contexts: ['link']
})

browser.menus.onClicked.addListener((info, tab) => {
	switch (info.menuItemId) {
		case 'selection-download-item':
			browser.tabs.sendMessage(tab.id, { type: 'selection' })
			break
		case 'download-item':
			if (info.linkUrl !== '') {
				download_item({type: 'download', url: [info.linkUrl]})
			}
			break
	}
})

async function download_item (request, sender, sendResponse) {
	let filter = await browser.storage.local.get('options').catch(e => { console.log(e); return null })
	if (filter.hasOwnProperty('options')) {
		filter = filter.options.filter
	} else {
		filter = '\\.(jpg|gif|png|zip|mp4)$'
	}
	console.log(filter)
	let reg = new RegExp(filter)
	let items = request.url.filter(function (element, index, array) {
		return element.match(reg) && array.indexOf(element) === index
	})
	if (request.type === 'download') {
		for (let i of items) {
			try {
				browser.downloads.download({
					url: i
				}).catch((reason) => { console.log(reason) })
			} catch (e) {
				console.log(e)
			}
		}
	} else if (request.type === 'count') {
		browser.menus.update('selection-download-item', {
			title: 'Download selected ' + items.length + ' items'
		})
	}
}

browser.runtime.onMessage.addListener(download_item)
