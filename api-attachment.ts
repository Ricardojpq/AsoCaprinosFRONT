export class ApiAttachment {

  // Attachment

  static AddAttachment(baseUrl: string) {
    return `${baseUrl}/api/Attachment`
  }

  static GetAttachments(baseUrl: string, entityType: string, entityId: string) {
    return `${baseUrl}/api/Attachment/entityTypeId=${entityType}/entityId=${entityId}`
  }

  static GetAttachmentsByEntityType(baseUrl: string, entityType: string) {
    return `${baseUrl}/api/Attachment/GetAttachmentsByEntityType/${entityType}`;
  }

  static GetAttachmentFileByIdentifier(baseUrl: string, identifier: string) {
    return `${baseUrl}/api/Attachment/GetAttachmentFile/${identifier}`
  }

  static GetAttachmentFileById(baseUrl: string, attachmentId: string) {
    return `${baseUrl}/api/Attachment/GetAttachmentFile/${attachmentId}`
  }

  static GetAttachmentCategoriesByEntityId(baseUrl: string, entityType: string) {
    return `${baseUrl}/api/Attachment/GetAttachmentCategoriesByEntityId/${entityType}`
  }

  static GetAttachmentByIdentifier(baseUrl: string, identifier: string) {
    return `${baseUrl}/api/Attachment/GetAttachmentByIdentifier/${identifier}`
  }

  static GetAttachmentById(baseUrl: string, attachmentId: string) {
    return `${baseUrl}/api/Attachment/GetAttachmentById/${attachmentId}`
  }

  static DeleteAttachmentByIdentifier(baseUrl: string, identifier: string) {
    return `${baseUrl}/api/Attachment/DeleteAttachmentByIdentifier/${identifier}`
  }
  static DeleteAttachmentById(baseUrl: string, attachmentId: string) {
    return `${baseUrl}/api/Attachment/DeleteAttachmentById/${attachmentId}`
  }

  static DownloadAttachmentByIdentifier(baseUrl: string, identifier: string) {
    return `${baseUrl}/api/Attachment/DownloadByIdentifier/${identifier}`
  }

  static DownloadAttachmentById(baseUrl: string, attachmentId: string) {
    return `${baseUrl}/api/Attachment/DownloadById/${attachmentId}`
  }

  // AttachmentCategory
  static AddAttachmentCategory(baseUrl: string): string {
    return `${baseUrl}/api/AttachmentCategory`;
  }

  static GetAttachmentCategory(baseUrl: string, attachmentCategoryId: string): string {
    return `${baseUrl}/api/AttachmentCategory?id=${attachmentCategoryId}`;
  }

  static GetAllAttachmentCategories(baseUrl: string): string {
    return `${baseUrl}/api/AttachmentCategory/GetAllAttachmentCategory`;
  }

  static UpdateAttachmentCategory(baseUrl: string, attachmentCategoryId: string): string {
    return `${baseUrl}/api/AttachmentCategory?id=${attachmentCategoryId}`;
  }

  static DeleteAttachmentCategory(baseUrl: string, attachmentCategoryId: string): string {
    return `${baseUrl}/api/AttachmentCategory?id=${attachmentCategoryId}`;
  }
}
