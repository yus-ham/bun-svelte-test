<script>
  import GridView from '~ui/widgets/GridView.svelte';


  let grid;
  let resource = '/crud/member';
</script>

<section>
  <h1>Data Member</h1>

  <GridView api-url="{resource}" bind:this="{grid}">
      <div slot="buttons"><a href="{resource}/new">Tambah</a></div>

      <tr slot="columns">
        <th>#</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Birth Date</th>
        <th>...</th>
      </tr>

      <tr slot="data-row" let:row>
        <td>{row._num}</td>
        <td>{row.name}</td>
        <td>{row.email}</td>
        <td>{row.phone}</td>
        <td>{new Date(row.dob).toString().slice(4, 15)}</td>
        <td>
          <a title="Edit" href="{resource}/{row.id}/edit"><small>[E]</small></a>
          <a title="Delete" data-id="{row.id}" data-method="delete" data-confirm="Are you sure you want to delete this member: `{row.name}`?"><small>[D]</small></a>
        </td>
      </tr>
  </GridView>
</section>
