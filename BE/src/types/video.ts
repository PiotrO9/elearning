export interface CreateVideoInput {
	courseId: string;
	title: string;
	order: number;
	isTrailer?: boolean;
	sourceUrl: string;
	durationSeconds?: number | null;
}

export interface UpdateVideoInput {
	courseId?: string;
	title?: string;
	order?: number;
	isTrailer?: boolean;
	sourceUrl?: string;
	durationSeconds?: number | null;
}

export interface AttachVideoOptions {
	order?: number;
	isTrailer?: boolean;
}
