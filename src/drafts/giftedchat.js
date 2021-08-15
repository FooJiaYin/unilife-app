
export default function GiftedChat(props) {
  onInitialLayoutViewLayout = (e) => {
    const { layout } = e.nativeEvent
    if (layout.height <= 0) {
      return
    }
    this.notifyInputTextReset()
    this.setMaxHeight(layout.height)
    const newComposerHeight = this.props.minComposerHeight
    const newMessagesContainerHeight = this.getMessagesContainerHeightWithKeyboard(
      newComposerHeight,
    )
    const initialText = this.props.initialText || ''
    this.setState({
      isInitialized: true,
      text: this.getTextFromProp(initialText),
      composerHeight: newComposerHeight,
      messagesContainerHeight: newMessagesContainerHeight,
    })
  }

  function onMainViewLayout(e) {
    // fix an issue when keyboard is dismissing during the initialization
    const { layout } = e.nativeEvent
    if (
      this.getMaxHeight() !== layout.height ||
      this.getIsFirstLayout() === true
    ) {
      this.setMaxHeight(layout.height)
      this.setState({
        messagesContainerHeight:
          this._keyboardHeight > 0
            ? this.getMessagesContainerHeightWithKeyboard()
            : this.getBasicMessagesContainerHeight(),
      })
    }
    if (this.getIsFirstLayout() === true) {
      this.setIsFirstLayout(false)
    }
  }
}