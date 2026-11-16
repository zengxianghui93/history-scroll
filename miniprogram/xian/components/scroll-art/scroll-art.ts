Component({
  properties: { src: String, label: String, mode: { type: String, value: 'scaleToFill' } },
  methods: {
    onLoad(): void { this.triggerEvent('artload'); },
  },
});
