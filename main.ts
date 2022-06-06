import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface PluginSettings {
	location: string
}
const DEFAULT_SETTINGS: PluginSettings = {
	location: 'rome'
}


const key = 'YOUR KEY'
async function getConditions(location: string) {
	let url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${key}`
	let req = await fetch(url)
	let json = await req.json()
	console.log(json)
	let conditions = json.weather[0].description
	conditions = conditions.replace(/^\w/, (c: string) => c.toUpperCase());
	return conditions
}

export default class StatusWeather extends Plugin {
	statusBar: HTMLElement;	
	settings: PluginSettings;
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	} 
	async saveSettings() {
		await this.saveData(this.settings);
	}
	
	async onload() {
		await this.loadSettings();
		this.statusBar = this.addStatusBarItem();
		var conditions = await getConditions(this.settings.location)
		this.statusBar.setText(conditions);
		this.registerInterval(
			window.setInterval(async () => {
				var conditions = await getConditions(this.settings.location)
				this.statusBar.setText(conditions);
				console.log('weather update')
			}, 60000)
		);
		this.addSettingTab(new SampleSettingTab(this.app, this));
  }
  async onunload() {
    // Release any resources configured by the plugin.
  } 
}

class SampleSettingTab extends PluginSettingTab {
	plugin: StatusWeather;

	constructor(app: App, plugin: StatusWeather) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Weather Plugin' });

		new Setting(containerEl)
			.setName('Choose location')
			.setDesc('Write the name of the city you want to have weather of')
			.addText(text => text
				.setValue(this.plugin.settings.location)
				.onChange(async (value) => {
					this.plugin.settings.location = value;
					await this.plugin.saveSettings();
				}));
	}
}