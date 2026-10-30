import { BadRequestException } from '#exceptions';

export class FeedbackService {
  #feedbackRepository;

  constructor({ feedbackRepository }) {
    this.#feedbackRepository = feedbackRepository;
  }

  async getFeedbacks(submissionId, page = 1, pageSize = 10) {
    page = Number(page);
    pageSize = Number(pageSize);
    const offset = (page - 1) * pageSize;

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      !Number.isSafeInteger(offset)
    ) {
      throw new BadRequestException(
        '페이지와 페이지 크기는 유효한 양의 정수여야 합니다',
      );
    }

    const items = await this.#feedbackRepository.findAll(submissionId, {
      offset,
      limit: pageSize,
    });

    const totalCount =
      await this.#feedbackRepository.countFeedbacks(submissionId);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  async createFeedback(submissionId, authorId, content) {
    return await this.#feedbackRepository.create(
      submissionId,
      authorId,
      content,
    );
  }
}
