import { Sleep, TweenPromise } from "./utils.js";


const Chats = {
	'start_game': [
		// { who: 'npc', text: 'aaaaa...', color: 0xb02d2d },
		{ who: 'player', text: 'Press J to continue', color: 0xb02d2d },
		{ who: 'player', text: 'Press WASD move!', color: 0xb02d2d },
		{ who: 'player', text: 'Clean up all monsters', color: 0xb02d2d },
	],
};


const BG_COLOR = 0xffffff;
const OVERSAMPLE_FACTOR = 6;


export class Conversation
{
	scene;
	index = 0;
	data = [];
	npc;
	speechBubble;
	speaker;
	constructor(scene)
	{
		this.scene = scene;
		this.speechBubble = new SpeechBubble(scene);
	}

	async start(key, npc = undefined, callback = undefined)
	{
		this.npc = npc;

		await new Promise(resolve =>
		{
			this.scene.cameras.main.stopFollow();
			// this.scene.cameras.main.zoomTo(1.4, 1000);
			this.speechBubble.open();
			this.scene.inputHandler.state = 'talk';
			this.scene.events.on('update', this.syncPosition, this);

			this.index = 0;
			this.data.length = 0;
			this.data.push(...Chats[key]);

			this.onEnd = async () =>
			{
				this.scene.events.off('update', this.syncPosition, this);
				this.index = 0;
				this.npc = undefined;
				this.speaker = undefined;
				// this.scene.cameras.main.zoomTo(1, 400);
				this.scene.cameras.main.startFollow(this.scene.player.container, false, 0.06, 0.06);
				this.scene.inputHandler.state = 'attack';
				await this.speechBubble.hide();
				resolve();
				if (callback) callback();
			}
		});
	}

	syncPosition()
	{
		const boxWidth = this.speechBubble.textBox.width + this.speechBubble.inset * 2 + 12;
		const boxHeight = this.speechBubble.textBox.height + this.speechBubble.inset * 2;
		const x = this.speaker.x - boxWidth / 2;
		const y = this.speaker.y - boxHeight - 16;

		this.speechBubble.container.setPosition(x, y);
	}

	onEnd()
	{

	}

	async next()
	{
		if (this.index >= this.data.length)
		{
			this.onEnd();
			return;
		}

		const { text, who, color } = this.data[this.index];
		this.speaker = this.getSpeaker(who);

		this.index++;
		this.cancelled = true;

		this.speechBubble.show(this.speaker.x, this.speaker.y - 16, text, color);
	}

	getSpeaker(key)
	{
		const map = {
			'player': this.scene.player.container,
			'npc': this.npc
		}

		return map[key];
	}
}


class SpeechBubble
{
	scene;
	container;
	textBox;
	graphics;
	inset = 3;
	index = 0;
	data = [];
	isReady = true;
	cancelled = false;
	boxWidth = 0;
	boxHeight = 0;

	constructor(scene)
	{
		this.scene = scene;

		this.textBox = scene.add.bitmapText(0, 0, 'fonts', '', 10);
		this.textBox.setActive(false);
		this.textBox.setVisible(false);
		this.textBox.setLeftAlign();
		this.textBox.tint = BG_COLOR;

		this.graphics = this.scene.add.graphics();
		this.graphics.fillStyle(0xffffff, 1);

		this.container = this.scene.add.container(0, 0);
		this.container.add(this.graphics);
		this.container.add(this.textBox);
		this.container.setDepth(990);
	}

	open()
	{
		this.textBox.setActive(true);
		this.textBox.setVisible(true);
		this.graphics.setActive(true);
		this.graphics.setVisible(true);
		this.container.setActive(true);
		this.container.setVisible(true);
	}

	async hide()
	{
		this.cancelTweens();

		await TweenPromise(this.scene, this.container, { scaleX: 1.1, scaleY: 1.1 }, 100);
		await TweenPromise(this.scene, this.container, { x: this.container.width / 2, scaleX: 0, scaleY: 0 }, 100);

		this.graphics.clear();
		this.textBox.setActive(false);
		this.textBox.setVisible(false);
		this.graphics.setActive(false);
		this.graphics.setVisible(false);
		this.container.setActive(false);
		this.container.setVisible(false);
	}

	async show(x, y, text, color)
	{
		this.cancelTweens();

		while (!this.isReady)
		{
			await Sleep(100);
		}

		this.isReady = false;
		this.cancelled = false;
		this.scene.cameras.main.pan(x, y, 1000, 'Sine.easeInOut', true);

		text = this.wrapText(text);

		this.textBox.setText(text);
		this.textBox.x = this.inset + 6;
		this.textBox.y = this.inset;

		this.graphics.clear();
		this.graphics.fillStyle(color, 1);

		let boxWidth = this.textBox.width + this.inset * 2 + 12;
		let boxHeight = this.textBox.height + this.inset * 2;

		this.graphics.fillRoundedRect(0, 0, boxWidth, boxHeight, 10);
		const triangleWidth = 2 * OVERSAMPLE_FACTOR;
		const triangleHeight = 5 * OVERSAMPLE_FACTOR / 6;
		this.graphics.fillTriangle(boxWidth / 2 - triangleWidth / 2, boxHeight, boxWidth / 2 + triangleWidth / 2, boxHeight, boxWidth / 2, boxHeight + triangleHeight);
		this.container.setScale(0);

		this.container.x = x - boxWidth / 2;
		this.container.y = y - boxHeight;

		this.textBox.setText("");
		this.boxWidth = boxWidth;
		this.boxHeight = boxHeight;

		await TweenPromise(this.scene, this.container, { x: x - boxWidth / 2, y: y - boxHeight, scaleX: 1.1, scaleY: 1.1 }, 100);

		await Promise.all([
			this.animateText(text),
			TweenPromise(this.scene, this.container, { scaleX: 1, scaleY: 1 }, 100)
		]);
		// this.animateText(text);
		// await TweenPromise(this.scene, this.container, { scaleX: 1, scaleY: 1 }, 100);

		this.isReady = true;
	}

	cancelTweens()
	{
		const tweens = this.scene.tweens.getTweensOf(this.textBox);
		for (let t of tweens)
		{
			t.stop();
			t.complete();
		}
	}

	wrapText(text)
	{
		const maxCharsPerLine = 30;
		const chars = text.length;

		let allText = '';
		let charsInLine = 0;

		for (let i = 0; i < chars; i++)
		{
			if (charsInLine++ > maxCharsPerLine && text[i] === ' ')
			{
				allText += '\n';
				charsInLine = 0;
			}
			else
			{
				allText += text[i];
			}
		};

		return allText;
	}

	async animateText(text)
	{
		let chars = text.length;
		let allText = '';
		let charsInLine = 0;

		this.setText('');

		for (let i = 0; i < chars; i++)
		{
			allText += text[i];

			this.setText(allText);

			if (text[i] === '\n') charsInLine = 0;

			await Sleep(10);
		};
	}

	setText(text)
	{
		this.textBox.setText(text);
	}
}