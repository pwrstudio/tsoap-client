<script>
  // # # # # # # # # # # # # #
  //
  //  Inventory Message
  //
  // # # # # # # # # # # # # #

  // PROPS
  export let caseStudy = ""
</script>

<style lang="scss">
  @import "./variables.scss";

  .inventory-message {
    display: flex;
    align-items: center;

    .color-icon {
      height: 10px;
      width: 10px;
      margin-right: 10px;

      &.communication {
        background: $COLOR_COMMUNICATION;
      }
      &.consensus-building {
        background: $COLOR_CONSENSUS_BUILDING;
      }
      &.sensing {
        background: $COLOR_SENSING;
      }
      &.archiving {
        background: $COLOR_ARCHIVING;
      }
    }

    .button {
      padding-left: 15px;
      padding-right: 15px;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_MID_2;
      border-radius: 10px;
      text-align: center;

      &:hover {
        border: 1px solid $COLOR_DARK;
        color: $COLOR_DARK;
        cursor: pointer;
      }
    }
  }
</style>

<div class="inventory-message">
  <div class="color-icon {caseStudy.category}" />
  <div>
    You are holding:
    <strong> {caseStudy.name}</strong>
    <span class="button">DROP</span>
  </div>
</div>
