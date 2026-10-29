export class FeedbackService {
  #feedbackRepository;

  constructor({ feedbackRepository }) {
    this.#feedbackRepository = feedbackRepository;
  }

  async getFeedbacks(submissionId) {
    return await this.#feedbackRepository.findAll(submissionId);
  }
}
