import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface PluginSettings {
	location: string,
	key: string
}
const DEFAULT_SETTINGS: PluginSettings = {
	location: 'rome',
	key:''
}


async function getConditions(location: string, key: string) {
	let conditions;
	try{
		let url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${key}`
		let req = await fetch(url)
		let json = await req.json()
		conditions = json.weather[0].description
		conditions = conditions.replace(/^\w/, (c: string) => c.toUpperCase());
	}catch(e){
		conditions = 'Error'
	}
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
		let firstRequest = false;
		this.statusBar = this.addStatusBarItem();
		if (this.settings.key && this.settings.location.length != 0) {
			var conditions = await getConditions(this.settings.location, this.settings.key);
			this.statusBar.setText(conditions);
			firstRequest = true
		} else {
			this.statusBar.setText('Error')
		}
		this.registerInterval(
			window.setInterval(async () => {
				if (this.settings.key && this.settings.location.length != 0) {
					console.log('ok')
					if(!firstRequest){
						console.log('not yet made!')
						var conditions = await getConditions(this.settings.location, this.settings.key);
						this.statusBar.setText(conditions);
						firstRequest = true
					}
				} else {
					this.statusBar.setText('Error')
					console.log('no request sent')
					firstRequest = false
				}
				
			}, 2000)
		);
		window.setInterval(async()=>{
			if (this.settings.key && this.settings.location.length != 0) {
				var conditions = await getConditions(this.settings.location, this.settings.key);
				this.statusBar.setText(conditions);
				console.log('refresh')
			}
		}, 600000)
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
				})
			);
		new Setting(containerEl)
			.setName('OpenWeather API key')
			.setDesc('A free OpenWeather API key is required for the plugin to work. Go to https://openweathermap.org to register and get a key')
			.addText(text => text
				.setValue(this.plugin.settings.key)
				.onChange(async (value) => {
					this.plugin.settings.key = value;
					await this.plugin.saveSettings();
				})
		)
	}
}