export class Modal {
  private dialog: HTMLDialogElement;
  private msg: HTMLElement;

  constructor(args: {
    dialog: HTMLDialogElement;
    msg: HTMLElement;
    close: HTMLElement;
  }) {
    this.dialog = args.dialog;
    this.msg = args.msg;
    args.close.onclick = () => this.dialog.close();
    this.dialog.addEventListener("close", () => {
      this.msg.innerHTML = "";
    });
  }

  open(message: string) {
    const node = document.createElement("p");
    node.innerText = message;
    this.msg.appendChild(node);
    this.dialog.showModal();
  }
}
