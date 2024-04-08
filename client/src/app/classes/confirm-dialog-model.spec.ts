import { ConfirmDialogModel } from '@app/classes/confirm-dialog-model';

describe('ConfirmDialogModel', () => {
    it('should create an instance with the given title and message', () => {
        const testTitle = 'Test Title';
        const testMessage = 'Test Message';
        const dialogModel = new ConfirmDialogModel(testTitle, testMessage);

        expect(dialogModel.title).toBe(testTitle);
        expect(dialogModel.message).toBe(testMessage);
    });
});
