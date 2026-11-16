import { beijingChallengeQuestions, ChallengeQuestion } from '../../data/beijing-challenge';
import { beijingMapPath } from '../../data/beijing-map';

Component({
  data: {
    questions: beijingChallengeQuestions,
    question: beijingChallengeQuestions[0],
    questionIndex: 0,
    selectedIndex: -1,
    score: 0,
    finished: false,
  },

  methods: {
    onAnswer(event: WechatMiniprogram.TouchEvent): void {
      if (this.data.finished || this.data.selectedIndex !== -1) return;
      const selectedIndex: unknown = event.currentTarget.dataset.index;
      if (selectedIndex !== 0 && selectedIndex !== 1) throw new RangeError('挑战答案选项无效');
      const correct: boolean = selectedIndex === this.data.question.correctIndex;
      this.setData({ selectedIndex, score: this.data.score + (correct ? 1 : 0) });
    },

    onNext(): void {
      if (this.data.finished || this.data.selectedIndex === -1) return;
      const questionIndex: number = this.data.questionIndex + 1;
      if (questionIndex === beijingChallengeQuestions.length) {
        this.setData({ finished: true });
        return;
      }
      this.setData({ questionIndex, question: beijingChallengeQuestions[questionIndex], selectedIndex: -1 });
    },

    onReplay(): void {
      this.setData({ question: beijingChallengeQuestions[0], questionIndex: 0, selectedIndex: -1, score: 0, finished: false });
    },

    onBrief(event: WechatMiniprogram.TouchEvent): void {
      const id: unknown = event.currentTarget.dataset.id;
      const question: ChallengeQuestion | undefined = beijingChallengeQuestions.find((item: ChallengeQuestion): boolean => item.id === id);
      if (!question) throw new RangeError('挑战短读入口无效');
      wx.navigateTo({ url: question.briefPath });
    },

    onMap(): void {
      wx.switchTab({ url: beijingMapPath });
    },
  },
});
