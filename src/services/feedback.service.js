export class FeedbackService {
  #feedbackRepository;

  constructor({ feedbackRepository }) {
    this.#feedbackRepository = feedbackRepository;
  }

  async getFeedbacks(submissionId) {
    return await this.#feedbackRepository.findAll(submissionId);
  }

  async createFeedback(submissionId, authorId, content) {
    return await this.#feedbackRepository.create(
      submissionId,
      authorId,
      content,
    );
  }
}
